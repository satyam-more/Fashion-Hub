/**
 * Database Restore Script
 * Restore MySQL database from backup file
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readline = require('readline');
require('dotenv').config();

const execAsync = promisify(exec);

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

/**
 * List available backup files
 */
function listAvailableBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith(`${DB_NAME}_backup_`) && (file.endsWith('.sql') || file.endsWith('.sql.gz')))
      .map(file => {
        const filepath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filepath);
        return {
          name: file,
          path: filepath,
          size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
          date: stats.mtime
        };
      })
      .sort((a, b) => b.date - a.date);
    
    return files;
  } catch (error) {
    console.error('❌ Failed to list backups:', error.message);
    return [];
  }
}

/**
 * Decompress backup file if needed
 */
async function decompressBackup(filepath) {
  if (!filepath.endsWith('.gz')) {
    return filepath;
  }
  
  try {
    console.log('🔄 Decompressing backup...');
    
    const decompressedPath = filepath.replace('.gz', '');
    const command = `gunzip -c "${filepath}" > "${decompressedPath}"`;
    
    await execAsync(command);
    
    console.log('✅ Backup decompressed');
    return decompressedPath;
    
  } catch (error) {
    console.error('❌ Decompression failed:', error.message);
    throw error;
  }
}

/**
 * Restore database from backup file
 */
async function restoreDatabase(backupPath) {
  try {
    console.log('🔄 Starting database restore...');
    console.log(`   Source: ${path.basename(backupPath)}`);
    
    // Validate environment variables
    if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
      throw new Error('Missing required database environment variables');
    }
    
    // Decompress if needed
    const sqlPath = await decompressBackup(backupPath);
    
    // Verify file exists
    if (!fs.existsSync(sqlPath)) {
      throw new Error('Backup file not found');
    }
    
    // MySQL restore command
    const command = `mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < "${sqlPath}"`;
    
    console.log('🔄 Restoring database...');
    await execAsync(command);
    
    // Clean up decompressed file if it was created
    if (sqlPath !== backupPath && fs.existsSync(sqlPath)) {
      fs.unlinkSync(sqlPath);
    }
    
    console.log('✅ Database restored successfully!');
    console.log(`   Database: ${DB_NAME}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    throw error;
  }
}

/**
 * Interactive restore process
 */
async function interactiveRestore() {
  console.log('\n🔄 Database Restore Process');
  console.log('═══════════════════════════\n');
  
  // List available backups
  const backups = listAvailableBackups();
  
  if (backups.length === 0) {
    console.log('❌ No backup files found in:', BACKUP_DIR);
    return false;
  }
  
  console.log('📋 Available Backups:\n');
  backups.forEach((backup, index) => {
    console.log(`   ${index + 1}. ${backup.name}`);
    console.log(`      Size: ${backup.size}, Date: ${backup.date.toISOString()}\n`);
  });
  
  // Get user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('Enter backup number to restore (or 0 to cancel): ', async (answer) => {
      rl.close();
      
      const choice = parseInt(answer);
      
      if (choice === 0 || isNaN(choice)) {
        console.log('❌ Restore cancelled');
        resolve(false);
        return;
      }
      
      if (choice < 1 || choice > backups.length) {
        console.log('❌ Invalid choice');
        resolve(false);
        return;
      }
      
      const selectedBackup = backups[choice - 1];
      
      console.log('\n⚠️  WARNING: This will overwrite the current database!');
      console.log(`   Database: ${DB_NAME}`);
      console.log(`   Backup: ${selectedBackup.name}\n`);
      
      const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl2.question('Type "CONFIRM" to proceed: ', async (confirmation) => {
        rl2.close();
        
        if (confirmation !== 'CONFIRM') {
          console.log('❌ Restore cancelled');
          resolve(false);
          return;
        }
        
        try {
          const startTime = Date.now();
          await restoreDatabase(selectedBackup.path);
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          console.log(`\n✅ Restore completed in ${duration}s`);
          resolve(true);
        } catch (error) {
          console.error('\n❌ Restore failed:', error.message);
          resolve(false);
        }
      });
    });
  });
}

// Run restore if executed directly
if (require.main === module) {
  // Check if backup file is provided as argument
  const backupFile = process.argv[2];
  
  if (backupFile) {
    // Direct restore from specified file
    const backupPath = path.isAbsolute(backupFile) 
      ? backupFile 
      : path.join(BACKUP_DIR, backupFile);
    
    restoreDatabase(backupPath)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    // Interactive restore
    interactiveRestore()
      .then(success => process.exit(success ? 0 : 1))
      .catch(() => process.exit(1));
  }
}

module.exports = {
  restoreDatabase,
  listAvailableBackups,
  decompressBackup
};
