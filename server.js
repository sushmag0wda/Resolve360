const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'complaint-secret-key',
  resave: false,
  saveUninitialized: true
}));

// ------------------ LANDING PAGE ------------------ //

app.get('/', (req, res) => {
  res.render('landing');
});

// ------------------ AUTH ROUTES ------------------ //

app.get('/login', (req, res) => {
  res.render('login', { message: req.query.message || '' });
});

app.get('/register', (req, res) => {
  res.render('register', { message: req.query.message || '' });
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const sql = 'INSERT INTO users (name, email, password, approved) VALUES (?, ?, ?, 0)';
  
  db.query(sql, [name, email, password], (err) => {
    if (err) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        errorMessage = 'Email already registered.';
      }
      return res.render('register', { message: errorMessage });
    }
    res.render('waiting-approval', { name });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.send('Login error.');
    if (!results || results.length === 0) {
      return res.redirect('/register?message=No account found. Please register.');
    }
    const user = results[0];
    if (!user.approved) {
      return res.render('waiting-approval', { name: user.name });
    }
    req.session.user = user;
    res.redirect('/dashboard?message=Login successful!');
  });
});

// ------------------ USER ROUTES ------------------ //

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const userId = req.session.user.id;

  const userQuery = 'SELECT name FROM users WHERE id = ?';
  const complaintQuery = `
    SELECT id, subject, description, status, reply, acknowledged, date 
    FROM complaints 
    WHERE user_id = ? 
    ORDER BY date DESC
  `;

  db.query(userQuery, [userId], (err, userResults) => {
    if (err || !userResults || userResults.length === 0) return res.send('Error loading dashboard.');
    db.query(complaintQuery, [userId], (err, complaints) => {
      if (err || !complaints) return res.send('Error loading complaints.');
      res.render('dashboard', {
        user: userResults[0],
        complaints,
        message: req.query.message || ''
      });
    });
  });
});

app.get('/complaint', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('complaint', { message: req.query.message || '' });
});

app.post('/submit-complaint', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { subject, description } = req.body;
  const userId = req.session.user.id;
  const sql = 'INSERT INTO complaints (user_id, subject, description) VALUES (?, ?, ?)';
  db.query(sql, [userId, subject, description], (err) => {
    if (err) return res.send('Failed to submit complaint.');
    res.redirect('/dashboard?message=Complaint submitted!');
  });
});

app.post('/user/acknowledge-complaint', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { complaintId } = req.body;
  const sql = 'UPDATE complaints SET acknowledged = 1 WHERE id = ? AND user_id = ?';
  db.query(sql, [complaintId, req.session.user.id], (err, result) => {
    if (err) return res.send('Error acknowledging complaint.');
    res.redirect('/dashboard?message=Complaint acknowledged!');
  });
});

app.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { message: req.query.message || '' });
});

app.post('/forgot-password', (req, res) => {
  const { email, newPassword } = req.body;
  const sql = 'UPDATE users SET password = ? WHERE email = ?';
  db.query(sql, [newPassword, email], (err, result) => {
    if (err) return res.send('Error resetting password.');
    if (!result || result.affectedRows === 0) {
      return res.redirect('/forgot-password?message=Email not found.');
    }
    res.redirect('/login?message=Password reset successful!');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login?message=Logged out successfully!');
  });
});

// ------------------ ADMIN ROUTES ------------------ //

app.get('/admin', (req, res) => {
  res.render('admin-login', { message: req.query.message || '' });
});

app.post('/admin', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM admins WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.send('Admin login error.');
    if (!results || results.length === 0) {
      return res.redirect('/admin?message=Invalid credentials');
    }
    req.session.admin = results[0];
    res.redirect('/admin-dashboard?message=Login successful!');
  });
});

app.get('/admin-dashboard', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin');

  const search = req.query.search || '';
  const query = `
    SELECT complaints.id, users.name AS username, complaints.subject, 
           complaints.description, complaints.status, complaints.reply, 
           complaints.acknowledged, complaints.date
    FROM complaints
    JOIN users ON complaints.user_id = users.id
    WHERE users.name LIKE ?
    ORDER BY complaints.date DESC
  `;

  db.query(query, [`%${search}%`], (err, results) => {
    if (err) return res.send('Error loading admin dashboard.');
    res.render('admin-dashboard', {
      admin: req.session.admin,
      complaints: results || [],
      message: req.query.message || '',
      search
    });
  });
});

app.post('/admin/update-status', (req, res) => {
  const { complaintId, status, reply } = req.body;
  const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.redirect('/admin-dashboard?message=Invalid status selected.');
  }
  const sql = 'UPDATE complaints SET status = ?, reply = ?, acknowledged = 0 WHERE id = ?';
  db.query(sql, [status, reply, complaintId], (err) => {
    if (err) return res.send('Failed to update complaint.');
    res.redirect('/admin-dashboard?message=Status updated!');
  });
});

app.post('/admin/delete-complaint', (req, res) => {
  const { complaintId } = req.body;
  const sql = 'DELETE FROM complaints WHERE id = ? AND acknowledged = 1';
  db.query(sql, [complaintId], (err, result) => {
    if (err) return res.send('Failed to delete complaint.');
    if (!result || result.affectedRows === 0) {
      return res.redirect('/admin-dashboard?message=User has not acknowledged yet.');
    }
    res.redirect('/admin-dashboard?message=Complaint deleted!');
  });
});

app.get('/admin-users', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin');

  const search = req.query.search || '';
  const sql = `
    SELECT id, name, email, approved 
    FROM users 
    WHERE (name LIKE ? OR email LIKE ?) AND approved = 0
    ORDER BY name ASC
  `;
  const keyword = `%${search}%`;
  db.query(sql, [keyword, keyword], (err, users) => {
    if (err) return res.send('Failed to load users.');
    res.render('admin-users', {
      admin: req.session.admin,
      users: users || [],
      message: req.query.message || '',
      search
    });
  });
});

app.post('/admin/approve-user', (req, res) => {
  const { userId } = req.body;
  const sql = 'UPDATE users SET approved = 1 WHERE id = ?';
  db.query(sql, [userId], (err) => {
    if (err) return res.send('Approval error.');
    res.redirect('/admin-users?message=User approved!');
  });
});

app.post('/admin/reject-user', (req, res) => {
  const { userId } = req.body;
  const sql = 'DELETE FROM users WHERE id = ? AND approved = 0';
  db.query(sql, [userId], (err, result) => {
    if (err) return res.send('Rejection failed.');
    if (!result || result.affectedRows === 0) {
      return res.redirect('/admin-users?message=User not found or already approved.');
    }
    res.redirect('/admin-users?message=User rejected and removed!');
  });
});

// ------------------ START SERVER ------------------ //

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});