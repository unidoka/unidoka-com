# Backup sidecar: Postgres dump + restic uploads.
#
# Uses the same Postgres major as the database service so pg_dump and
# pg_restore stay compatible with the server. restic is installed from
# Alpine and provides client-side encryption, deduplication, retention
# and integrity checks — the object store never sees plaintext.
FROM postgres:15-alpine

RUN apk add --no-cache restic tzdata

COPY common.sh /usr/local/lib/backup/common.sh
COPY backup.sh restore.sh entrypoint.sh healthcheck.sh /usr/local/bin/
RUN chmod 0755 /usr/local/bin/backup.sh \
    /usr/local/bin/restore.sh \
    /usr/local/bin/entrypoint.sh \
    /usr/local/bin/healthcheck.sh \
    /usr/local/lib/backup/common.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["daemon"]
