#!/bin/sh
# One backup pass: dump Postgres, upload the dump + media to restic,
# apply retention, and periodically verify repository integrity.
set -eu
. /usr/local/lib/backup/common.sh

require_backup_config
pg_env

[ -d "$STORAGE_DIR" ] || fail "media directory $STORAGE_DIR is missing"
ensure_repo

# Refuse to start a dump that could fill the small production disk.
db_size=$(psql \
    --host="$MAIN_DB_HOST" \
    --port="${MAIN_DB_PORT:-5432}" \
    --username="$MAIN_DB_USER" \
    --dbname="$MAIN_DB_NAME" \
    --tuples-only --no-align \
    --command="SELECT pg_database_size('$MAIN_DB_NAME')") ||
    fail "cannot read database size"
free_bytes=$(df -Pk /tmp | awk 'NR == 2 { print $4 * 1024 }')
if [ "$free_bytes" -lt "$db_size" ]; then
    fail "not enough free space in /tmp for a database dump" \
        "(need ~$db_size bytes, have $free_bytes)"
fi

stamp=$(date -u +%Y%m%dT%H%M%SZ)
dump="/tmp/${MAIN_DB_NAME}-${stamp}.dump"
trap 'rm -f "$dump" "$dump.tmp"' EXIT

log "dumping database $MAIN_DB_NAME from $MAIN_DB_HOST"
pg_dump \
    --host="$MAIN_DB_HOST" \
    --port="${MAIN_DB_PORT:-5432}" \
    --username="$MAIN_DB_USER" \
    --dbname="$MAIN_DB_NAME" \
    --format=custom \
    --compress=6 \
    --no-owner \
    --no-privileges \
    --file="$dump.tmp"

[ -s "$dump.tmp" ] || fail "pg_dump produced an empty file"
pg_restore --list "$dump.tmp" >/dev/null || fail "pg_dump output is not a readable archive"
mv "$dump.tmp" "$dump"
log "database dump ready ($(du -h "$dump" | cut -f1))"

log "uploading database snapshot"
restic_do backup --tag database --host unidoka "$dump"

log "uploading media snapshot"
restic_do backup --tag media --host unidoka "$STORAGE_DIR"

# Group by host+tag, not by path: every dump has a unique filename, and
# the default grouping would keep all of them forever.
log "applying retention policy"
restic_do forget \
    --group-by host,tags \
    --keep-daily 7 \
    --keep-weekly 4 \
    --keep-monthly 6 \
    --prune

now=$(date +%s)
if [ ! -f "$STATE_DIR/last_check" ] ||
    [ $((now - $(cat "$STATE_DIR/last_check"))) -gt 604800 ]; then
    log "verifying repository (metadata + 2% of packs)"
    restic_do check --read-data-subset=2%
    date +%s >"$STATE_DIR/last_check"
fi

date +%s >"$STATE_DIR/last_success"
log "backup finished"
