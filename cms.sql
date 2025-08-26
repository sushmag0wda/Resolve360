-- Create database
CREATE DATABASE IF NOT EXISTS complaint_system;
USE complaint_system;

-- Drop tables if they exist
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admins;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    approved TINYINT(1) DEFAULT 0
);

-- Create complaints table
CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    subject VARCHAR(255),
    description TEXT,
    status ENUM('Pending','In Progress','Resolved','Rejected') DEFAULT 'Pending',
    reply TEXT,
    acknowledged BOOLEAN DEFAULT false,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create admins table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    password VARCHAR(255)
);

-- Insert admin users
INSERT INTO admins (username, password) VALUES 
('sushma', 'sush123'),
('admin', 'admin123'),
('sush', 'sush123');

-- Show tables
SHOW TABLES;

-- Optional: see inserted admins
SELECT * FROM admins;
