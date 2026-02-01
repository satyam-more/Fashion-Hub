const mysql = require('mysql2/promise');
require('dotenv').config();

async function rollbackRazorpayChanges() {
    let connection;

    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✓ Connected to database');

        // Drop Razorpay-related columns
        try {
            await connection.execute('ALTER TABLE orders DROP COLUMN IF EXISTS razorpay_order_id');
            console.log('✓ Dropped razorpay_order_id column');
        } catch (error) {
            console.log('  Column razorpay_order_id does not exist (skipped)');
        }

        try {
            await connection.execute('ALTER TABLE orders DROP COLUMN IF EXISTS razorpay_payment_id');
            console.log('✓ Dropped razorpay_payment_id column');
        } catch (error) {
            console.log('  Column razorpay_payment_id does not exist (skipped)');
        }

        try {
            await connection.execute('ALTER TABLE orders DROP COLUMN IF EXISTS razorpay_signature');
            console.log('✓ Dropped razorpay_signature column');
        } catch (error) {
            console.log('  Column razorpay_signature does not exist (skipped)');
        }

        // Simplify payment_method enum to only COD
        await connection.execute(`
      ALTER TABLE orders 
      MODIFY COLUMN payment_method ENUM('cod') DEFAULT 'cod'
    `);
        console.log('✓ Simplified orders.payment_method enum to COD only');

        // Simplify payment_status enum
        await connection.execute(`
      ALTER TABLE orders 
      MODIFY COLUMN payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending'
    `);
        console.log('✓ Simplified orders.payment_status enum');

        console.log('\n✅ Razorpay rollback completed successfully!');

    } catch (error) {
        console.error('❌ Error during rollback:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Database connection closed');
        }
    }
}

// Run if executed directly
if (require.main === module) {
    rollbackRazorpayChanges()
        .then(() => {
            console.log('✅ Rollback migration completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Rollback migration failed:', error);
            process.exit(1);
        });
}

module.exports = rollbackRazorpayChanges;
