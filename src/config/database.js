const mysql = require('mysql2');
require('dotenv').config();

// Buat pool koneksi
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'backend(telco)',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// PENTING: Kita export versi promise()
// Tanpa .promise(), fungsi await db.query() tidak akan jalan dan error "not a function"
const db = pool.promise();

module.exports = db;