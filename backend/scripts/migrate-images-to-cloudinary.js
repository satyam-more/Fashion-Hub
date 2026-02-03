/**
 * Migration Script: Update Database Image URLs to Cloudinary
 * 
 * This script updates all product image URLs in the database from localhost
 * to Cloudinary URLs.
 * 
 * Usage: node scripts/migrate-images-to-cloudinary.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dyt3sdvbz/image/upload';

async function migrateImages() {
  let connection;
  
  try {
    console.log('🔄 Starting image URL migration to Cloudinary...\n');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com')) ? { rejectUnauthorized: false } : undefined
    });
    
    console.log('✅ Connected to database\n');
    
    // Get all products with images
    const [products] = await connection.execute(
      'SELECT product_id, product_name, images FROM products WHERE images IS NOT NULL'
    );
    
    console.log(`📦 Found ${products.length} products with images\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const product of products) {
      try {
        const images = JSON.parse(product.images);
        
        // Check if images need updating (contain localhost)
        const needsUpdate = images.some(img => img && img.includes('localhost'));
        
        if (!needsUpdate) {
          console.log(`⏭️  Skipping "${product.product_name}" - already using external URLs`);
          skippedCount++;
          continue;
        }
        
        // Convert localhost URLs to Cloudinary URLs
        const updatedImages = images.map(img => {
          if (!img || !img.includes('localhost')) return img;
          
          // Extract filename from localhost URL
          // Example: http://localhost:5000/uploads/products/Blue Jeans-123.jpg
          const filename = img.split('/').pop();
          
          // Remove file extension and special characters for Cloudinary public_id
          const publicId = filename
            .replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
            .replace(/\s+/g, '_');
          
          // Return Cloudinary URL (Cloudinary auto-converts to webp)
          return `${CLOUDINARY_BASE_URL}/v1770096116/${publicId}.webp`;
        });
        
        // Update database
        await connection.execute(
          'UPDATE products SET images = ? WHERE product_id = ?',
          [JSON.stringify(updatedImages), product.product_id]
        );
        
        console.log(`✅ Updated "${product.product_name}" (${images.length} images)`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Error updating product ${product.product_id}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount} products`);
    console.log(`   ⏭️  Skipped: ${skippedCount} products`);
    console.log(`   📦 Total: ${products.length} products`);
    console.log('='.repeat(50) + '\n');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run migration
migrateImages();
