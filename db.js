const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',      // <-- MUST BE EMPTY
    database: 'complaint_system'
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to MySQL:', err.message);
    } else {
        console.log('✅ Connected to MySQL database!');
    }
});

module.exports = connection;
