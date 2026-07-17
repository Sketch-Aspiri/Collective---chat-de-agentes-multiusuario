#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo "TODO: run pg_dump against \$DATABASE_URL and upload to backup storage (backup-${TIMESTAMP}.sql)."
