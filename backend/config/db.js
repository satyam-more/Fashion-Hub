const mysql = require("mysql2/promise");

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "fashion_hub"
    });
    return connection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

module.exports = createConnection;