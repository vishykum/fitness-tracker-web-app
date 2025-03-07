require('dotenv').config(); //Load environment variables

const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONECTION_LIMIT || 10,
    queueLimit: 0,
    ssl: process.env.NODE_ENV === 'production' ? { //DB client only connects to production server with a valid certificate
        ca: process.env.SSL_CERT_PATH,
        rejectUnauthorized: true
    } : false
});

module.exports = pool;