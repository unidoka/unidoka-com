# Backups

Encrypted, scheduled backups of production data to S3-compatible object
storage. Runs as a sidecar container (`backup`) next to the database.

| Data | How | Why |
|---|---|---|
| PostgreSQL (`main_db`) | `pg_dump --format=custom` consistency snapshot, uploaded by restic | The only irreplaceable data |
| Uploaded media (`backend/services/main-service/storage`) | restic (deduplicated, incremental) | Avatars, event covers, order files |
| Valkey | **not** backed up | Cache, rate limits and OTPs are disposable |
| Traefik certificates | **not** backed up | Re-issued by Let's Encrypt |

restic encrypts everything **client-side**: the bucket only ever holds
ciphertext, and the encryption key never leaves the VPS. It also
deduplicates, so repeated media snapshots stay cheap.

Schedule: one pass per `BACKUP_INTERVAL_SECONDS` (default 24 h). The
first pass runs as soon as the container starts.

Retention: 7 daily, 4 weekly, 6 monthly snapshots (`restic forget
--prune`). Media is also pruned; deleted uploads disappear from future
snapshots but are still recoverable from older ones.

## 1. Create the bucket

Use any S3-compatible provider (Yandex Object Storage, VK Cloud,
Selectel, AWS, Backblaze B2, MinIO). Use a bucket that is **not** the
one the app uses for anything else.

- Private access. No public read.
- Enable **object versioning** and a lifecycle rule that expires
  non-current versions after 30–90 days. This is what protects you from
  an accidental `restic prune`, a bad key or ransomware.
- Pick a region/provider different from the VPS when possible.

Yandex Object Storage example endpoint:
`s3:https://storage.yandexcloud.net/unidoka-backups`

AWS example: `s3:s3.amazonaws.com/unidoka-backups`

## 2. Create least-privilege credentials

restic needs list/read/write/delete inside the bucket prefix — and
nothing else. Do not reuse application credentials or an admin key.

AWS IAM policy (Yandex/VK policies are equivalent):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
      "Resource": "arn:aws:s3:::unidoka-backups"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": "arn:aws:s3:::unidoka-backups/*"
    }
  ]
}
```

## 3. Generate the encryption password

```bash
openssl rand -base64 48
```

Put it in a password manager **and** an offline copy. `RESTIC_PASSWORD`
is the only way to read the backups: lose it and every snapshot is
permanently unreadable, including to you.

## 4. Configure the VPS

Add to `.env` (never commit it):

```dotenv
RESTIC_REPOSITORY=s3:https://storage.yandexcloud.net/unidoka-backups
RESTIC_PASSWORD=<the password from step 3>
BACKUP_S3_ACCESS_KEY_ID=<key id>
BACKUP_S3_SECRET_ACCESS_KEY=<secret>
BACKUP_S3_REGION=ru-central1
BACKUP_INTERVAL_SECONDS=86400
```

Lock the file down:

```bash
chmod 600 .env
```

The service reads only these values — not the rest of `.env`.

## 5. Start it

```bash
docker compose --profile prod up -d backup
docker compose --profile prod logs -f backup
```

The first run prints `initializing restic repository`, then
`backup finished`. Later runs only upload changes. A normal deploy
starts the sidecar automatically.

Check status:

```bash
docker compose --profile prod ps backup          # healthy after the first success
docker compose --profile prod logs --tail=50 backup
```

The healthcheck goes unhealthy when the last successful backup is older
than two intervals — point an uptime monitor at it or at the logs.

## 6. Verify the backup (do this once, then quarterly)

```bash
docker compose --profile prod run --rm backup restore snapshots
docker compose --profile prod run --rm backup restore check
```

`restore check` validates repository metadata; the daily job also reads
2% of pack data every week.

## 7. Restore

### Database → a new database (safe default)

`restore db` writes to `<MAIN_DB_NAME>_restore` unless you name another
database, so the live data is untouched:

```bash
docker compose --profile prod run --rm -e CONFIRM_RESTORE=yes backup restore db latest
docker compose exec main-db \
  psql -U root -d main_db_restore -c '\dt'
```

Spot-check rows, then swap:

```bash
# 1. Stop writers.
docker compose stop main-service
# 2. Rename (connect to the maintenance DB, not main_db).
docker compose exec main-db psql -U root -d postgres -c \
  'ALTER DATABASE main_db RENAME TO main_db_old'
docker compose exec main-db psql -U root -d postgres -c \
  'ALTER DATABASE main_db_restore RENAME TO main_db'
# 3. Start and verify.
docker compose start main-service
```

Keep `main_db_old` until the restored data is confirmed, then drop it.

### Media → a temporary directory, then copy in

The composer mount is read-only, so restore to a scratch directory and
inspect before overwriting anything:

```bash
mkdir -p /tmp/media-restore
docker compose --profile prod run --rm \
  -v /tmp/media-restore:/restore \
  backup restore media latest /restore
ls /tmp/media-restore/data/storage/order_files

# After review:
rsync -a --dry-run /tmp/media-restore/data/storage/ backend/services/main-service/storage/
rsync -a /tmp/media-restore/data/storage/ backend/services/main-service/storage/
```

Use `sudo` for the copy if the storage directory is owned by root (normal
for files written by the containers). `rsync` without `--delete` only
adds and overwrites, so existing files are not removed.

## 8. Safety checklist

- [ ] Bucket is private, versioned, with a lifecycle rule.
- [ ] Credentials can only touch this bucket; they are not the app keys.
- [ ] `RESTIC_PASSWORD` is in a password manager **and** offline.
- [ ] `.env` is `chmod 600` and not in Git.
- [ ] `docker compose --profile prod ps backup` has been healthy for a few days.
- [ ] A restore drill was done; the restored DB and files were opened.
- [ ] Someone gets alerted when the healthcheck turns unhealthy.
- [ ] Restore drills are repeated quarterly — a backup that was never
      restored is only a hope.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `RESTIC_REPOSITORY is not set` | Missing env vars, or compose was run outside the repo root |
| 403 / signature errors | Wrong endpoint, region or keys |
| `wrong password or no key found` | `RESTIC_PASSWORD` does not match the repository |
| `could not connect to server` | `main-db` is not healthy; `depends_on` should prevent it |
| Healthcheck unhealthy but logs look fine | Last success is older than two intervals; check `docker compose --profile prod logs backup` |
| First backup is slow | Media upload + initial dedup index; subsequent runs are incremental |

The repository is locked while a backup runs. Do not run `restore` at
the same time as the scheduled pass; restic waits for the lock.
