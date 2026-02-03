/**
 * Sync Cloudinary Images to Database
 * 
 * This script fetches all images from Cloudinary and updates the database
 * with the correct URLs including the Cloudinary-generated suffixes.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function syncImages() {
  let connection;
  
  try {
    console.log('🔄 Fetching images from Cloudinary...\n');
    
    // Fetch all images from Cloudinary
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      resource_type: 'image'
    });
    
    console.log(`✅ Found ${result.resources.length} images on Cloudinary\n`);
    
    // Create a mapping: base filename -> full Cloudinary URL
    const imageMap = {};
    
    result.resources.forEach(resource => {
      const url = resource.secure_url;
      const publicId = resource.public_id;
      
      // Extract base filename (remove Cloudinary suffix like _abc123)
      // Example: Blue_Printed_Comfort_Fit_Cotton_T-Shirt-1763624657134-964377322_jbteiu
      // Base: Blue_Printed_Comfort_Fit_Cotton_T-Shirt-1763624657134-964377322
      const baseFilename = publicId.replace(/_[a-z0-9]{6}$/, '');
      
      if (!imageMap[baseFilename]) {
        imageMap[baseFilename] = [];
      }
      imageMap[baseFilename].push(url);
    });
    
    console.log(`📊 Mapped ${Object.keys(imageMap).length} unique base filenames\n`);
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com')) 
        ? { rejectUnauthorized: false } 
        : undefined
    });
    
    console.log('✅ Connected to database\n');
    
    // Get all products
    const [products] = await connection.execute(
      'SELECT product_id, product_name, images FROM products WHERE images IS NOT NULL'
    );
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    for (const product of products) {
      try {
        const images = JSON.parse(product.images);
        const updatedImages = [];
        
        for (const img of images) {
          if (!img || !img.includes('localhost')) {
            // Already a valid URL or empty
            updatedImages.push(img);
            continue;
          }
          
          // Extract filename from localhost URL
          const filename = img.split('/').pop().replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
          const baseFilename = filename.replace(/\s+/g, '_');
          
          // Find matching Cloudinary URL
          if (imageMap[baseFilename] && imageMap[baseFilename].length > 0) {
            // Use the first matching URL
            updatedImages.push(imageMap[baseFilename].shift());
          } else {
            console.warn(`⚠️  No Cloudinary match for: ${filename}`);
            notFoundCount++;
            // Keep the old URL for now
            updatedImages.push(img);
          }
        }
        
        // Update database
        await connection.execute(
          'UPDATE products SET images = ? WHERE product_id = ?',
          [JSON.stringify(updatedImages), product.product_id]
        );
        
        console.log(`✅ Updated "${product.product_name}" (${updatedImages.length} images)`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Error updating product ${product.product_id}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Sync Summary:');
    console.log(`   ✅ Updated: ${updatedCount} products`);
    console.log(`   ⚠️  Not found: ${notFoundCount} images`);
    console.log(`   📦 Total products: ${products.length}`);
    console.log('='.repeat(60) + '\n');
    
    console.log('🎉 Sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    if (error.error && error.error.message) {
      console.error('   Cloudinary error:', error.error.message);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

syncImages();
