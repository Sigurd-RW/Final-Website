const express = require('express');
const path = require('path');
const db = require('./models/db');
const validator = require('validator');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.post('/signup', (req, res) => {
  const { email, username, password } = req.body;
  if (!validator.isEmail(email)) {
    return res.status(400).send('<h2>Invalid email</h2>');
  }
  if (!username) {
    return res.status(400).send('<h2>Username cannot be empty</h2>');
  }
  if (!password) {
    return res.status(400).send('<h2>Password cannot be empty</h2>');
  }

  const sanitizedUsername = validator.escape(username);
  const sanitizedPassword = validator.escape(password);

  const sql = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
  db.query(sql, [email, sanitizedUsername, sanitizedPassword], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('<h2>There was an error connecting to the database. Please try again later.</h2>');
    }
    res.redirect('/students');
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('<h2>There was an error connecting to the database. Please try again later.</h2>');
    }
    if (results.length === 0) {
      return res.status(400).send('<h2>Email not found. Please sign up.</h2>');
    }
    const user = results[0];
    if (password !== user.password) {
      return res.status(400).send('<h2>Incorrect password.</h2>');
    }
    res.redirect('/students');
  });
});

// GET all students
app.get('/students', (req, res) => {
  const { sort_by = 'last_name', order = 'ASC', major, class_standing } = req.query;

  let sql = 'SELECT * FROM students';
  const conditions = [];
  const values = [];

  if (major) {
    conditions.push('major = ?');
    values.push(major);
  }

  if (class_standing) {
    conditions.push('class_standing = ?');
    values.push(class_standing);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  const validSortFields = ['student_id', 'first_name', 'last_name', 'gpa', 'enrollment_year'];
  const validOrders = ['ASC', 'DESC'];

  if (validSortFields.includes(sort_by) && validOrders.includes(order.toUpperCase())) {
    sql += ` ORDER BY ${sort_by} ${order.toUpperCase()}`;
  }

  db.query(sql, values, (err, rows) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    let html = `<html><head>
    <title>Student List</title>
    <link rel="stylesheet" href="style.css">
    </head><body>
    <header>
      <h1>Student List</h1>
    </header>
    <div class="container">
        <a href="/">← Back to Home</a>
    <form method="GET" action="/students">
      <label>Search by Major:</label>
      <input type="text" name="major" value="${major || ''}"/>
      <label>Class Standing:</label>
      <select name="class_standing">
        <option value="">All</option>
        <option value="Freshman"${class_standing === 'Freshman' ? ' selected' : ''}>Freshman</option>
        <option value="Sophomore"${class_standing === 'Sophomore' ? ' selected' : ''}>Sophomore</option>
        <option value="Junior"${class_standing === 'Junior' ? ' selected' : ''}>Junior</option>
        <option value="Senior"${class_standing === 'Senior' ? ' selected' : ''}>Senior</option>
      </select>
      <label>Sort By:</label>
      <select name="sort_by">
        <option value="student_id"${sort_by === 'student_id' ? ' selected' : ''}>Student ID</option>
        <option value="last_name"${sort_by === 'last_name' ? ' selected' : ''}>Last Name</option>
        <option value="first_name"${sort_by === 'first_name' ? ' selected' : ''}>First Name</option>
        <option value="gpa"${sort_by === 'gpa' ? ' selected' : ''}>GPA</option>
        <option value="enrollment_year"${sort_by === 'enrollment_year' ? ' selected' : ''}>Enrollment Year</option>
      </select>
      <select name="order">
        <option value="ASC"${order === 'ASC' ? ' selected' : ''}>Ascending</option>
        <option value="DESC"${order === 'DESC' ? ' selected' : ''}>Descending</option>
      </select>
      <button type="submit">Apply</button>
      <a href="/add.html" class="button">Register Student</a>
    </form>

    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Email</th><th>Major</th>
          <th>Enrollment Year</th><th>GPA</th><th>Standing</th><th>Actions</th>
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

    html += `</tbody></table></div></body></html>`;
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

//Add student
app.post('/add', (req, res) => {
  const { first_name, last_name, email, enrollment_year, major, gpa, class_standing } = req.body;

  if (!first_name || !last_name || !email || !enrollment_year || !major || !gpa || !class_standing) {
    return res.status(400).send('<h2>All fields are required.</h2>');
  }

  if (!validator.isEmail(email)) {
    return res.status(400).send('<h2>Invalid email format.</h2>');
  }

  const sql = `
    INSERT INTO students (first_name, last_name, email, enrollment_year, major, gpa, class_standing)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [first_name, last_name, email, enrollment_year, major, gpa, class_standing];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error adding student:', err);
      return res.status(500).send('<h2>Database error. Please try again later.</h2>');
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