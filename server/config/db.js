const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// DB path
const dbPath = path.join(__dirname, '../database/smartbus.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
  }
});

module.exports = db;