const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// ✅ Correct DB path (server folder - for Railway deployment)
const dbPath = path.join(__dirname, '../smartbus.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Load schema and seed
    loadSchema();
  }
});

// ======================
// LOAD SCHEMA
// ======================
function loadSchema() {
  const schemaPath = path.join(__dirname, '../../database/schema.sql');

  try {
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    db.exec(schemaSQL, (err) => {
      if (err) {
        console.error('Error loading schema:', err.message);
      } else {
        console.log('Schema loaded successfully.');

      }
    });
  } catch (error) {
    console.error('Error reading schema file:', error.message);
  }
}

// Export DB
module.exports = db;