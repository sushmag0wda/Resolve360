const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'complaint_system.sqlite');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const connection = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening SQLite database:', err.message);
    } else {
        console.log(`✅ Connected to SQLite database at ${dbPath}`);
    }
});

connection.serialize(() => {
    connection.run('PRAGMA foreign_keys = ON');

    connection.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            approved INTEGER DEFAULT 0
        )
    `);

    connection.run(`
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            subject TEXT,
            description TEXT,
            status TEXT CHECK(status IN ('Pending','In Progress','Resolved','Rejected')) DEFAULT 'Pending',
            reply TEXT,
            acknowledged INTEGER DEFAULT 0,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    connection.run(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);

    const seedAdmins = [
        ['sushma', 'sush123'],
        ['admin', 'admin123'],
        ['sush', 'sush123']
    ];

    const insertAdmin = connection.prepare(`
        INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)
    `);
    seedAdmins.forEach(([username, password]) => {
        insertAdmin.run(username, password);
    });
    insertAdmin.finalize();

    connection.run(`
        INSERT OR IGNORE INTO users (id, name, email, password, approved)
        VALUES (1, 'Demo User', 'user@example.com', 'user123', 1)
    `);
});

const query = (sql, params = [], callback = () => {}) => {
    const trimmed = sql.trim().toLowerCase();
    const isSelect = trimmed.startsWith('select') || trimmed.startsWith('pragma');

    if (isSelect) {
        connection.all(sql, params, (err, rows) => {
            callback(err, rows);
        });
    } else {
        connection.run(sql, params, function runCallback(err) {
            if (err) {
                return callback(err);
            }
            callback(null, { affectedRows: this.changes, insertId: this.lastID });
        });
    }
};

module.exports = {
    query,
    connection
};
