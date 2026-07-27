const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'attendance.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roll TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      course TEXT NOT NULL,
      attended INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 1
    )
  `, (err) => {
    if (err) {
      console.error('Error creating students table:', err.message);
    } else {
      // Seed sample students if table is empty
      db.get('SELECT COUNT(*) AS count FROM students', [], (err, row) => {
        if (!err && row.count === 0) {
          const insertStmt = db.prepare(`
            INSERT INTO students (roll, name, course, attended, total)
            VALUES (?, ?, ?, ?, ?)
          `);
          insertStmt.run('101', 'Alice Johnson', 'Computer Science', 18, 20);
          insertStmt.run('102', 'Bob Smith', 'Information Technology', 15, 20);
          insertStmt.run('103', 'Charlie Brown', 'Electronics', 12, 20);
          insertStmt.finalize();
          console.log('Database seeded with sample student data.');
        }
      });
    }
  });
});

module.exports = db;
