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

app.get('/students', (req, res) => {
  const sql = 'SELECT * FROM students';
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.send('An error occurred while fetching students.');
    }

    let html = `<html><head><title>Student List</title></head><body>
    <h1>Students</h1>
    <a href="/">Back to Home</a>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Email</th><th>Course</th><th>Actions</th>
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
            <a href="/update.html?id=${student.id}">Update</a> |
            <a href="/delete/${student.id}">Delete</a>
          </td>
        </tr>`;
    });

    html += `</tbody></table></body></html>`;
    res.send(html);
  });
});

app.get('/delete/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM students WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting student:', err);
      return res.send('An error occurred while deleting the student.');
    }
    res.redirect('/students');
  });
});

app.post('/update/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, course } = req.body;
  const sql = 'UPDATE students SET name = ?, email = ?, course = ? WHERE id = ?';

  db.query(sql, [name, email, course, id], (err, result) => {
    if (err) {
      console.error('Error updating student:', err);
      return res.send('An error occurred while updating the student.');
    }
    res.redirect('/students');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
