/**
 * Database Backup Script
 * Automated MySQL database backup with compression and rotation
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
require('dotenv').config();

const execAsync = promisify(exec);

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
const MAX_BACKUPS = parseInt(process.env.MAX_BACKUPS) || 7; // Keep last 7 backups
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
}

/**
 * Generate backup filename with timestamp
 */
function getBackupFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${DB_NAME}_backup_${timestamp}_${time}.sql`;
}

/**
 * Create database backup using mysqldump
 */
async function createBackup() {
  try {
    console.log('🔄 Starting database backup...');
    
    // Validate environment variables
    if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
      throw new Error('Missing required database environment variables');
    }

    const filename = getBackupFilename();
    const filepath = path.join(BACKUP_DIR, filename);
    
    // mysqldump command
    const command = `mysqldump -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > "${filepath}"`;
    
    // Execute backup
    await execAsync(command);
    
    // Verify backup file was created
    if (!fs.existsSync(filepath)) {
      throw new Error('Backup file was not created');
    }
    
    const stats = fs.statSync(filepath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Backup created successfully!`);
    console.log(`   File: ${filename}`);
    console.log(`   Size: ${fileSizeMB} MB`);
    console.log(`   Path: ${filepath}`);
    
    return filepath;
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

/**
 * Compress backup file using gzip
 */
async function compressBackup(filepath) {
  try {
    console.log('🔄 Compressing backup...');
    
    const gzipPath = `${filepath}.gz`;
    const command = `gzip -f "${filepath}"`;
    
    await execAsync(command);
    
    if (!fs.existsSync(gzipPath)) {
      throw new Error('Compressed file was not created');
    }
    
    const stats = fs.statSync(gzipPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Backup compressed successfully!`);
    console.log(`   Size: ${fileSizeMB} MB`);
    console.log(`   File: ${path.basename(gzipPath)}`);
    
    return gzipPath;
    
  } catch (error) {
    console.error('⚠️  Compression failed:', error.message);
    // Return original file if compression fails
    return filepath;
  }
}

/**
 * Remove old backups to maintain rotation policy
 */
function rotateBackups() {
  try {
    console.log('🔄 Rotating old backups...');
    
    // Get all backup files
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith(`${DB_NAME}_backup_`))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by newest first
    
    // Remove old backups
    if (files.length > MAX_BACKUPS) {
      const toDelete = files.slice(MAX_BACKUPS);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`   Deleted old backup: ${file.name}`);
      });
      console.log(`✅ Removed ${toDelete.length} old backup(s)`);
    } else {
      console.log(`✅ No old backups to remove (${files.length}/${MAX_BACKUPS})`);
    }
    
  } catch (error) {
    console.error('⚠️  Backup rotation failed:', error.message);
  }
}

/**
 * List all available backups
 */
function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith(`${DB_NAME}_backup_`))
      .map(file => {
        const filepath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filepath);
        return {
          name: file,
          size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
          date: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log('\n📋 Available Backups:');
    if (files.length === 0) {
      console.log('   No backups found');
    } else {
      files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name}`);
        console.log(`      Size: ${file.size}, Date: ${file.date}`);
      });
    }
    
    return files;
    
  } catch (error) {
    console.error('❌ Failed to list backups:', error.message);
    return [];
  }
}

/**
 * Main backup process
 */
async function runBackup() {
  const startTime = Date.now();
  
  console.log('\n🚀 Database Backup Process Started');
  console.log(`   Database: ${DB_NAME}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log('');
  
  try {
    // Create backup
    const backupPath = await createBackup();
    
    // Compress backup
    const compressedPath = await compressBackup(backupPath);
    
    // Rotate old backups
    rotateBackups();
    
    // List all backups
    listBackups();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Backup completed successfully in ${duration}s`);
    console.log(`   Backup location: ${BACKUP_DIR}`);
    
    return {
      success: true,
      filepath: compressedPath,
      duration
    };
    
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`\n❌ Backup failed after ${duration}s`);
    console.error(`   Error: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      duration
    };
  }
}

// Run backup if executed directly
if (require.main === module) {
  runBackup()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  runBackup,
  createBackup,
  compressBackup,
  rotateBackups,
  listBackups
};
