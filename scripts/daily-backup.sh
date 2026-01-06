#!/bin/bash

# SmartWrite Companion - Daily Backup Script
# Creates a ZIP backup of the entire project (excluding BKP folder)
# Usage: ./scripts/daily-backup.sh

set -e

# Get project root directory (parent of scripts/)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Generate backup filename with current date
BACKUP_DATE=$(date +%Y-%m-%d)
BACKUP_FILE="BKP/BKP-${BACKUP_DATE}.zip"

# Ensure BKP directory exists
mkdir -p BKP

# Check if backup for today already exists
if [ -f "$BACKUP_FILE" ]; then
    echo "⚠️  Backup for today already exists: $BACKUP_FILE"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Backup cancelled."
        exit 0
    fi
    rm "$BACKUP_FILE"
fi

echo "📦 Creating daily backup: $BACKUP_FILE"
echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Create ZIP excluding BKP, node_modules, and other ignored files
# Using git ls-files to only include tracked files + manually added important ignored files
zip -r "$BACKUP_FILE" . \
    -x "BKP/*" \
    -x "node_modules/*" \
    -x ".git/*" \
    -x ".claude/*" \
    -x "temp-obsidian-submission/*" \
    -x "temp_check/*" \
    -x "*.DS_Store" \
    -x "dist/*" \
    -x "*.swp" \
    -x "*.swo" \
    -x "*~" \
    -q

# Get file size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo ""
echo "✅ Backup created successfully!"
echo "📄 File: $BACKUP_FILE"
echo "💾 Size: $BACKUP_SIZE"
echo ""
echo "📋 Backup contents:"
unzip -l "$BACKUP_FILE" | head -20
echo "   ... (use 'unzip -l $BACKUP_FILE' to see full list)"
echo ""

# Optional: Clean up old backups (keep last 30 days)
echo "🧹 Cleaning up old backups (keeping last 30 days)..."
find BKP -name "BKP-*.zip" -type f -mtime +30 -delete 2>/dev/null || true

# List recent backups
echo ""
echo "📚 Recent backups:"
ls -lh BKP/BKP-*.zip 2>/dev/null | tail -5 || echo "   No previous backups found"
