#!/bin/bash
# Postgres backup script for transit adapter
# Usage: ./backup-postgres.sh [backup_dir]

set -e
BACKUP_DIR="${1:-./backups}"
DB_URL="${DATABASE_URL:-postgres://postgres:postgres@localhost:5432/transit}"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
mkdir -p "$BACKUP_DIR"
FILENAME="$BACKUP_DIR/transit_backup_$DATE.sql.gz"

echo "Backing up Postgres to $FILENAME"
pg_dump "$DB_URL" | gzip > "$FILENAME"
echo "Backup complete: $FILENAME"
