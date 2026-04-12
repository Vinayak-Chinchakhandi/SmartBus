const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// DB path
const dbPath = path.join(__dirname, '../../database/smartbus.db');

// Connect DB
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DB connection error:', err.message);
  } else {
    console.log('Connected to DB for seeding');
    runSeed();
  }
});

function runSeed() {
  const seedPath = path.join(__dirname, '../../database/seed.sql');

  try {
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    db.exec(seedSQL, (err) => {
      if (err) {
        console.error('Seed error:', err.message);
      } else {
        console.log('✅ Seed data inserted successfully');
      }

      db.close();
    });
  } catch (error) {
    console.error('Error reading seed file:', error.message);
  }
}