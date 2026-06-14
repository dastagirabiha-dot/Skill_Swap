// =========================================================
// config/db.js — MySQL connection pool
// Node.js only connects here. All logic lives in MySQL.
// =========================================================
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "skill_swap",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verify connection on startup
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ Connected to MySQL database: skill_swap");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  });

module.exports = pool;
