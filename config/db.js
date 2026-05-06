const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'unisync',
    port: 3306,
});

module.exports = pool.promise();