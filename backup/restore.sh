#!/bin/sh
# Restore helper. Destructive actions require CONFIRM_RESTORE=yes.
#
#   restore.sh snapshots
#   restore.sh check
#   restore.sh db <snapshot|latest> [target-db]
#   restore.sh media <snapshot|latest> <target-dir>
#
# `db` restores into a NEW database by default (<MAIN_DB_NAME>_restore)
# so the live database is never touched unless you name it explicitly.
set -eu
. /usr/local/lib/backup/common.sh

usage() {
    cat <<'EOF'
Usage:
  restore.sh snapshots
  restore.sh check
  restore.sh db <snapshot|latest> [target-db]
  restore.sh media <snapshot|latest> <target-dir>

Database restore defaults to <MAIN_DB_NAME>_restore and requires
CONFIRM_RESTORE=yes. Media is restored under <target-dir>/data/storage.
EOF
}

cmd="${1:-help}"
case "$cmd" in
snapshots)
    require_backup_config
    restic_do snapshots
    ;;
check)
    require_backup_config
    restic_do check
    ;;
db)
    [ $# -ge 2 ] || {
        usage
        exit 1
    }
    snapshot="$2"
    target="${3:-${MAIN_DB_NAME}_restore}"
    require_backup_config
    [ "${CONFIRM_RESTORE:-}" = "yes" ] ||
        fail "refusing to restore: re-run with CONFIRM_RESTORE=yes"

    pg_env
    work=$(mktemp -d)
    trap 'rm -rf "$work"' EXIT

    log "downloading database dump from snapshot $snapshot"
    restic_do restore "$snapshot" --tag database --target "$work" --include "*.dump"
    dump=$(find "$work" -name '*.dump' | head -n 1)
    [ -n "$dump" ] || fail "snapshot $snapshot contains no database dump"
    pg_restore --list "$dump" >/dev/null || fail "dump is not a readable archive"

    if ! psql \
        --host="$MAIN_DB_HOST" \
        --port="${MAIN_DB_PORT:-5432}" \
        --username="$MAIN_DB_USER" \
        --dbname=postgres \
        --tuples-only --no-align \
        --command="SELECT 1 FROM pg_database WHERE datname = '$target'" |
        grep -q 1; then
        log "creating database $target"
        createdb \
            --host="$MAIN_DB_HOST" \
            --port="${MAIN_DB_PORT:-5432}" \
            --username="$MAIN_DB_USER" \
            --owner="$MAIN_DB_USER" \
            "$target"
    fi

    log "restoring into database $target"
    pg_restore \
        --host="$MAIN_DB_HOST" \
        --port="${MAIN_DB_PORT:-5432}" \
        --username="$MAIN_DB_USER" \
        --dbname="$target" \
        --clean --if-exists \
        --no-owner --no-privileges \
        "$dump"
    log "database restore finished ($target)"
    ;;
media)
    [ $# -ge 3 ] || {
        usage
        exit 1
    }
    snapshot="$2"
    target="$3"
    require_backup_config
    mkdir -p "$target"
    log "restoring media from snapshot $snapshot into $target"
    restic_do restore "$snapshot" --tag media --target "$target" --include "$STORAGE_DIR"
    log "media restored under $target$STORAGE_DIR"
    ;;
help | *)
    usage
    ;;
esac
