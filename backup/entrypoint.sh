#!/bin/sh
# Process entry point for the backup sidecar.
set -eu
. /usr/local/lib/backup/common.sh

mkdir -p "$STATE_DIR"

case "${1:-daemon}" in
daemon)
    interval="${BACKUP_INTERVAL_SECONDS:-86400}"
    log "backup daemon started (interval ${interval}s)"
    while true; do
        last=$(cat "$STATE_DIR/last_success" 2>/dev/null || echo 0)
        wait=$((last + interval - $(date +%s)))
        if [ "$wait" -gt 0 ]; then
            log "next backup in ${wait}s"
            sleep "$wait"
        fi
        if /usr/local/bin/backup.sh; then
            continue
        fi
        log "backup failed; retrying in 15 minutes"
        sleep 900
    done
    ;;
backup)
    exec /usr/local/bin/backup.sh
    ;;
restore)
    shift
    exec /usr/local/bin/restore.sh "$@"
    ;;
*)
    exec "$@"
    ;;
esac
