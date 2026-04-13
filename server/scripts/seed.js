const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// DB path
const dbPath = path.join(__dirname, '../database/smartbus.db');

// Connect DB
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DB connection error:', err.message);
  } else {
    console.log('Connected to DB');

    db.run('PRAGMA foreign_keys = ON');

    runSchema();
  }
});

// ======================
// STEP 1: CREATE TABLES
// ======================
function runSchema() {
  const schemaPath = path.join(__dirname, '../database/schema.sql');

  try {
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    db.exec(schemaSQL, (err) => {
      if (err) {
        console.error('Schema error:', err.message);
      } else {
        console.log('✅ Schema created');

        runSeed(); // next step
      }
    });
  } catch (error) {
    console.error('Error reading schema file:', error.message);
  }
}

// ======================
// STEP 2: INSERT DATA
// ======================
function runSeed() {
  const seedPath = path.join(__dirname, '../database/seed.sql');

  try {
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    db.exec(seedSQL, (err) => {
      if (err) {
        console.error('Seed error:', err.message);
      } else {
        console.log('✅ Seed data inserted');
      }

      db.close();
    });
  } catch (error) {
    console.error('Error reading seed file:', error.message);
  }
}