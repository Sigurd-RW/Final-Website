const express = require('express');
const path = require('path');
const db = require('./models/db');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/add', (req, res) => {
  const { student_id, first_name, last_name, email, enrollment_year, major, gpa, class_standing } = req.body;
  const sql = 'INSERT INTO students (student_id, first_name, last_name, email, enrollment_year, major, gpa, class_standing) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(sql, [student_id, first_name, last_name, email, enrollment_year, major, gpa, class_standing], (err, result) => {
    if (err) {
      console.error('Error adding student:', err);
      return res.send('An error occurred while adding student.');
    }
    res.redirect('/');
  });
});

// GET all students
app.get('/students', (req, res) => {
  const sql = 'SELECT * FROM students';
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    let html = `<html><head><title>Student List</title></head><body>
    <h1>Students</h1>
    <a href="/">Back to Home</a>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Email</th><th>Major</th>
          <th>Year</th><th>GPA</th><th>Standing</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>`;

    rows.forEach(student => {
      html += `
        <tr>
          <td>${student.student_id}</td>
          <td>${student.first_name} ${student.last_name}</td>
          <td>${student.email}</td>
          <td>${student.major}</td>
          <td>${student.enrollment_year}</td>
          <td>${student.gpa}</td>
          <td>${student.class_standing}</td>
          <td>
            <a href="/update.html?id=${student.student_id}">Update</a> |
            <form style="display:inline" method="POST" action="/delete/${student.student_id}">
              <button type="submit">Delete</button>
            </form>
          </td>
        </tr>`;
    });

    html += `</tbody></table></body></html>`;
    res.send(html);
  });
});

// GET single student
app.get('/students/:id', (req, res) => {
  const sql = 'SELECT * FROM students WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(results[0]);
  });
});

// DELETE student
app.post('/delete/:student_id', (req, res) => {
  const sql = 'DELETE FROM students WHERE student_id = ?';
  db.query(sql, [req.params.student_id], (err, result) => {
    if (err) {
      console.error('Error deleting student:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.redirect('/students');
  });
});

// UPDATE student
app.post('/update/:student_id', (req, res) => {
  const { student_id } = req.params;
  const { first_name, last_name, email, enrollment_year, major, gpa, class_standing } = req.body;
  const sql = 'UPDATE students SET first_name = ?, last_name = ?, email = ?, enrollment_year = ?, major = ?, gpa = ?, class_standing = ? WHERE student_id = ?';

  db.query(sql, [first_name, last_name, email, enrollment_year, major, gpa, class_standing, student_id], (err, result) => {
    if (err) {
      console.error('Error updating student:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.redirect('/students');
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
