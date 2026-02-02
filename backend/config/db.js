const mysql = require("mysql2/promise");

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fashion_hub",
      ssl: process.env.DB_HOST.includes('aivencloud.com') ? {
        rejectUnauthorized: false
      } : undefined
    });
    return connection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

module.exports = createConnection;