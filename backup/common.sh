#!/bin/sh
# Shared helpers for the backup sidecar. Sourced by the other scripts.
set -eu

STATE_DIR="${STATE_DIR:-/state}"
STORAGE_DIR="${STORAGE_DIR:-/data/storage}"
RESTIC_CACHE_DIR="${RESTIC_CACHE_DIR:-/tmp/restic-cache}"

log() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
fail() {
    log "ERROR: $*"
    exit 1
}

restic_do() { restic --cache-dir "$RESTIC_CACHE_DIR" "$@"; }

require_backup_config() {
    [ -n "${RESTIC_REPOSITORY:-}" ] || fail "RESTIC_REPOSITORY is not set"
    [ -n "${RESTIC_PASSWORD:-}" ] || fail "RESTIC_PASSWORD is not set"
    [ -n "${MAIN_DB_HOST:-}" ] || fail "MAIN_DB_HOST is not set"
    [ -n "${MAIN_DB_USER:-}" ] || fail "MAIN_DB_USER is not set"
    [ -n "${MAIN_DB_PASSWORD:-}" ] || fail "MAIN_DB_PASSWORD is not set"
    [ -n "${MAIN_DB_NAME:-}" ] || fail "MAIN_DB_NAME is not set"
}

ensure_repo() {
    mkdir -p "$RESTIC_CACHE_DIR" "$STATE_DIR"
    if restic_do cat config >/dev/null 2>&1; then
        return 0
    fi
    log "initializing restic repository at $RESTIC_REPOSITORY"
    restic_do init
}

pg_env() { export PGPASSWORD="${MAIN_DB_PASSWORD:-}"; }
