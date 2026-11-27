#!/bin/sh
# Docker healthcheck: fail when the last successful backup is older
# than two backup intervals.
set -eu
. /usr/local/lib/backup/common.sh

[ -f "$STATE_DIR/last_success" ] || exit 1
age=$(($(date +%s) - $(cat "$STATE_DIR/last_success")))
max=$((${BACKUP_INTERVAL_SECONDS:-86400} * 2))
[ "$age" -le "$max" ]
