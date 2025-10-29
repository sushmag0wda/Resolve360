-- SQLite schema for the complaint management system
-- Run with: sqlite3 complaint_system.sqlite < cms.sql

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admins;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    approved INTEGER DEFAULT 0
);

CREATE TABLE complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject TEXT,
    description TEXT,
    status TEXT CHECK(status IN ('Pending','In Progress','Resolved','Rejected')) DEFAULT 'Pending',
    reply TEXT,
    acknowledged INTEGER DEFAULT 0,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
);

INSERT OR IGNORE INTO admins (username, password) VALUES 
('sushma', 'sush123'),
('admin', 'admin123'),
('sush', 'sush123');

INSERT OR IGNORE INTO users (id, name, email, password, approved) VALUES
(1, 'Demo User', 'user@example.com', 'user123', 1);
