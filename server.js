const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { role, username, password } = req.body;

  if (!role || !username || !password) {
    return res.status(400).json({ error: 'Role, username, and password are required.' });
  }

  if (role === 'teacher') {
    if (username === 'teacher' && password === '1234') {
      return res.json({ success: true, role: 'teacher', message: 'Teacher logged in successfully.' });
    } else {
      return res.status(401).json({ error: 'Invalid Teacher credentials.' });
    }
  } else if (role === 'student') {
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    db.get(
      `SELECT * FROM students 
       WHERE (LOWER(name) = LOWER(?) OR roll = ?) 
         AND (roll = ? OR LOWER(name) = LOWER(?))`,
      [cleanUser, cleanUser, cleanPass, cleanPass],
      (err, student) => {
        if (err) {
          return res.status(500).json({ error: 'Database error.' });
        }
        if (!student) {
          return res.status(401).json({ error: 'Invalid Student credentials (Check Name and Roll Number).' });
        }
        return res.json({ success: true, role: 'student', student });
      }
    );
  } else {
    return res.status(400).json({ error: 'Invalid role selected.' });
  }
});

// GET all students
app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching students.' });
    }
    res.json(rows);
  });
});

// GET student by Roll Number
app.get('/api/students/roll/:roll', (req, res) => {
  const roll = req.params.roll;
  db.get('SELECT * FROM students WHERE roll = ?', [roll], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching student.' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    res.json(row);
  });
});

// POST add a new student
app.post('/api/students', (req, res) => {
  const { name, roll, course, attended, total } = req.body;

  if (!name || !roll || !course || attended === undefined || total === undefined) {
    return res.status(400).json({ error: 'All fields (name, roll, course, attended, total) are required.' });
  }

  const query = 'INSERT INTO students (name, roll, course, attended, total) VALUES (?, ?, ?, ?, ?)';
  db.run(query, [name, roll, course, Number(attended), Number(total)], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: `Roll number '${roll}' already exists.` });
      }
      return res.status(500).json({ error: 'Failed to insert student record.' });
    }
    res.status(201).json({
      id: this.lastID,
      name,
      roll,
      course,
      attended: Number(attended),
      total: Number(total)
    });
  });
});

// PUT update student details/attendance by ID
app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { attended, total, name, roll, course } = req.body;

  db.get('SELECT * FROM students WHERE id = ?', [id], (err, student) => {
    if (err || !student) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    const updatedAttended = attended !== undefined ? Number(attended) : student.attended;
    const updatedTotal = total !== undefined ? Number(total) : student.total;
    const updatedName = name || student.name;
    const updatedRoll = roll || student.roll;
    const updatedCourse = course || student.course;

    const query = `
      UPDATE students
      SET name = ?, roll = ?, course = ?, attended = ?, total = ?
      WHERE id = ?
    `;

    db.run(query, [updatedName, updatedRoll, updatedCourse, updatedAttended, updatedTotal, id], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update student record.' });
      }
      res.json({
        id: Number(id),
        name: updatedName,
        roll: updatedRoll,
        course: updatedCourse,
        attended: updatedAttended,
        total: updatedTotal
      });
    });
  });
});

// DELETE a student by ID
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM students WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete student.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Student record not found.' });
    }
    res.json({ message: 'Student deleted successfully.' });
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
