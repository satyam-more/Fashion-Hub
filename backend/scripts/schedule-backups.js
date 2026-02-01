/**
 * Backup Scheduler
 * Schedule automated database backups using node-cron
 */

const cron = require('node-cron');
const { runBackup } = require('./backup-database');
require('dotenv').config();

// Backup schedule from environment or default to daily at 2 AM
const BACKUP_SCHEDULE = process.env.BACKUP_SCHEDULE || '0 2 * * *';

console.log('\n📅 Backup Scheduler Started');
console.log(`   Schedule: ${BACKUP_SCHEDULE}`);
console.log(`   Next backup: ${getNextBackupTime()}`);
console.log('');

/**
 * Get next backup time based on cron schedule
 */
function getNextBackupTime() {
  // This is a simplified version - in production use a proper cron parser
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(2, 0, 0, 0);
  return tomorrow.toISOString();
}

/**
 * Schedule backup task
 */
const backupTask = cron.schedule(BACKUP_SCHEDULE, async () => {
  console.log('\n⏰ Scheduled backup triggered');
  console.log(`   Time: ${new Date().toISOString()}`);
  
  try {
    const result = await runBackup();
    
    if (result.success) {
      console.log('✅ Scheduled backup completed successfully');
    } else {
      console.error('❌ Scheduled backup failed');
    }
  } catch (error) {
    console.error('❌ Scheduled backup error:', error.message);
  }
}, {
  scheduled: true,
  timezone: process.env.TZ || 'UTC'
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping backup scheduler...');
  backupTask.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping backup scheduler...');
  backupTask.stop();
  process.exit(0);
});

// Keep process running
console.log('✅ Backup scheduler is running');
console.log('   Press Ctrl+C to stop\n');

module.exports = backupTask;
