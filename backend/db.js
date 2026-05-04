const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',        // Default XAMPP username
    password: '',        // Default XAMPP password is empty
    database: 'unisync'
});

// Immediate test to confirm the database is reachable
pool.getConnection()
    .then(connection => {
        console.log('✅ Connected to the MySQL database via Pool.');
        connection.release(); // Send the connection back to the pool
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

module.exports = pool;