# 💾 Database Backup & Restore Guide

## Overview

Fashion Hub includes a comprehensive automated backup system for MySQL database protection and disaster recovery.

---

## Features

- ✅ Automated daily backups
- ✅ Backup compression (gzip)
- ✅ Automatic backup rotation
- ✅ Interactive restore process
- ✅ Scheduled backups with cron
- ✅ Configurable retention policy
- ✅ Backup verification

---

## Quick Start

### Manual Backup
```bash
npm run backup
```

### Restore from Backup
```bash
npm run restore
```

### Start Scheduled Backups
```bash
npm run backup:schedule
```

---

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Backup Configuration
BACKUP_DIR=./backups          # Backup storage directory
MAX_BACKUPS=7                 # Number of backups to keep
BACKUP_SCHEDULE=0 2 * * *     # Cron schedule (daily at 2 AM)
TZ=UTC                        # Timezone for scheduled backups
```

### Cron Schedule Examples

```bash
# Every day at 2 AM
0 2 * * *

# Every 6 hours
0 */6 * * *

# Every Sunday at 3 AM
0 3 * * 0

# Every day at midnight
0 0 * * *

# Every hour
0 * * * *
```

---

## Manual Backup

### Create Backup

```bash
cd backend
npm run backup
```

**Output:**
```
🚀 Database Backup Process Started
   Database: fashion_hub
   Time: 2025-02-01T12:00:00.000Z

🔄 Starting database backup...
✅ Backup created successfully!
   File: fashion_hub_backup_2025-02-01_12-00-00.sql
   Size: 2.45 MB
   Path: /path/to/backups/fashion_hub_backup_2025-02-01_12-00-00.sql

🔄 Compressing backup...
✅ Backup compressed successfully!
   Size: 0.45 MB
   File: fashion_hub_backup_2025-02-01_12-00-00.sql.gz

🔄 Rotating old backups...
✅ No old backups to remove (3/7)

📋 Available Backups:
   1. fashion_hub_backup_2025-02-01_12-00-00.sql.gz
      Size: 0.45 MB, Date: 2025-02-01T12:00:00.000Z

✅ Backup completed successfully in 3.45s
   Backup location: /path/to/backups
```

### What Happens:
1. Creates SQL dump of database
2. Compresses with gzip
3. Removes old backups (keeps last 7)
4. Lists all available backups

---

## Restore Database

### Interactive Restore

```bash
cd backend
npm run restore
```

**Process:**
1. Lists all available backups
2. Prompts you to select a backup
3. Asks for confirmation
4. Restores the database

**Example:**
```
🔄 Database Restore Process
═══════════════════════════

📋 Available Backups:

   1. fashion_hub_backup_2025-02-01_12-00-00.sql.gz
      Size: 0.45 MB, Date: 2025-02-01T12:00:00.000Z

   2. fashion_hub_backup_2025-01-31_12-00-00.sql.gz
      Size: 0.43 MB, Date: 2025-01-31T12:00:00.000Z

Enter backup number to restore (or 0 to cancel): 1

⚠️  WARNING: This will overwrite the current database!
   Database: fashion_hub
   Backup: fashion_hub_backup_2025-02-01_12-00-00.sql.gz

Type "CONFIRM" to proceed: CONFIRM

🔄 Decompressing backup...
✅ Backup decompressed
🔄 Restoring database...
✅ Database restored successfully!
   Database: fashion_hub

✅ Restore completed in 5.23s
```

### Direct Restore (Non-Interactive)

```bash
# Restore specific backup file
node scripts/restore-database.js fashion_hub_backup_2025-02-01_12-00-00.sql.gz
```

---

## Scheduled Backups

### Start Scheduler

```bash
cd backend
npm run backup:schedule
```

**Output:**
```
📅 Backup Scheduler Started
   Schedule: 0 2 * * *
   Next backup: 2025-02-02T02:00:00.000Z

✅ Backup scheduler is running
   Press Ctrl+C to stop
```

### Run as Background Service

#### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start backup scheduler
pm2 start scripts/schedule-backups.js --name "backup-scheduler"

# View logs
pm2 logs backup-scheduler

# Stop scheduler
pm2 stop backup-scheduler

# Restart scheduler
pm2 restart backup-scheduler
```

#### Using systemd (Linux)

Create `/etc/systemd/system/fashion-hub-backup.service`:

```ini
[Unit]
Description=Fashion Hub Database Backup Scheduler
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/fashion-hub/backend
ExecStart=/usr/bin/node scripts/schedule-backups.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable fashion-hub-backup
sudo systemctl start fashion-hub-backup
sudo systemctl status fashion-hub-backup
```

---

## Backup Storage

### Local Storage

Backups are stored in `backend/backups/` by default.

**Structure:**
```
backend/
├── backups/
│   ├── fashion_hub_backup_2025-02-01_12-00-00.sql.gz
│   ├── fashion_hub_backup_2025-01-31_12-00-00.sql.gz
│   └── fashion_hub_backup_2025-01-30_12-00-00.sql.gz
```

### Cloud Storage (Recommended for Production)

#### AWS S3

```bash
# Install AWS CLI
npm install aws-sdk --save

# Upload backup to S3
aws s3 cp backups/fashion_hub_backup_2025-02-01.sql.gz \
  s3://your-bucket/backups/
```

#### Google Cloud Storage

```bash
# Install gcloud CLI
npm install @google-cloud/storage --save

# Upload backup
gsutil cp backups/fashion_hub_backup_2025-02-01.sql.gz \
  gs://your-bucket/backups/
```

---

## Backup Rotation

The system automatically maintains the configured number of backups (default: 7).

**Rotation Policy:**
- Keeps the most recent `MAX_BACKUPS` files
- Automatically deletes older backups
- Runs after each backup

**Example:**
```
MAX_BACKUPS=7

Current backups: 8
Action: Delete oldest backup
Result: 7 backups remaining
```

---

## Monitoring

### Check Backup Status

```bash
# List all backups
ls -lh backend/backups/

# Check backup sizes
du -sh backend/backups/*

# Count backups
ls backend/backups/ | wc -l
```

### Verify Backup Integrity

```bash
# Test gzip file
gunzip -t backend/backups/fashion_hub_backup_2025-02-01.sql.gz

# View backup contents (first 20 lines)
gunzip -c backend/backups/fashion_hub_backup_2025-02-01.sql.gz | head -20
```

---

## Production Recommendations

### 1. Use Cloud Storage
- Store backups in AWS S3, Google Cloud Storage, or Azure Blob
- Enable versioning and lifecycle policies
- Use cross-region replication

### 2. Encrypt Backups
```bash
# Encrypt backup with GPG
gpg --symmetric --cipher-algo AES256 backup.sql.gz

# Decrypt backup
gpg --decrypt backup.sql.gz.gpg > backup.sql.gz
```

### 3. Test Restores Regularly
- Schedule monthly restore tests
- Verify data integrity
- Document restore procedures

### 4. Monitor Backup Jobs
- Set up alerts for failed backups
- Monitor backup sizes
- Track backup duration

### 5. Multiple Backup Strategies
- **Daily**: Full database backup
- **Hourly**: Incremental backups (if supported)
- **Weekly**: Long-term retention
- **Monthly**: Archive backups

---

## Troubleshooting

### Backup Fails

**Error:** `mysqldump: command not found`
```bash
# Install MySQL client
# Ubuntu/Debian
sudo apt-get install mysql-client

# macOS
brew install mysql-client

# Windows
# Download from MySQL website
```

**Error:** `Access denied for user`
```bash
# Check database credentials in .env
# Ensure user has backup privileges
GRANT SELECT, LOCK TABLES ON fashion_hub.* TO 'backup_user'@'localhost';
```

### Restore Fails

**Error:** `Database not empty`
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE fashion_hub; CREATE DATABASE fashion_hub;"

# Then restore
npm run restore
```

**Error:** `Disk space full`
```bash
# Check available space
df -h

# Clean old backups
rm backend/backups/old_backup_*.sql.gz
```

---

## Backup Best Practices

1. **Regular Backups**: Daily at minimum
2. **Test Restores**: Monthly verification
3. **Off-site Storage**: Cloud backup copies
4. **Encryption**: Encrypt sensitive data
5. **Monitoring**: Alert on failures
6. **Documentation**: Keep restore procedures updated
7. **Retention**: Balance storage vs. recovery needs
8. **Automation**: Use scheduled backups
9. **Verification**: Check backup integrity
10. **Access Control**: Secure backup files

---

## Emergency Recovery

### Quick Restore Process

1. **Stop Application**
   ```bash
   pm2 stop fashion-hub
   ```

2. **Restore Database**
   ```bash
   npm run restore
   ```

3. **Verify Data**
   ```bash
   mysql -u root -p fashion_hub -e "SELECT COUNT(*) FROM users;"
   ```

4. **Restart Application**
   ```bash
   pm2 start fashion-hub
   ```

---

## Support

For backup issues:
- Check logs in `backend/logs/`
- Verify database connection
- Ensure sufficient disk space
- Check MySQL client installation

---

**Last Updated:** February 1, 2025  
**Version:** 1.0.0
