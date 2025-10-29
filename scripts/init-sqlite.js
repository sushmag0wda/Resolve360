const db = require('../db');

db.query("SELECT name FROM sqlite_master WHERE type = 'table'", [], (err, rows) => {
  if (err) {
    console.error('Failed to list tables:', err);
    db.connection.close();
    process.exit(1);
  }
  console.log('Existing tables:', rows);
  db.connection.close((closeErr) => {
    if (closeErr) {
      console.error('Error closing connection:', closeErr);
      process.exit(1);
    }
    console.log('SQLite database initialized.');
  });
});
