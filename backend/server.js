const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2');
const crypto  = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host:     'localhost',
    user:     'root',
    password: '',
    database: 'unisync',
    waitForConnections: true,
    connectionLimit:    10,
});

db.getConnection((err, conn) => {
    if (err) { console.error('MySQL connection failed:', err.message); process.exit(1); }
    console.log('Connected to MySQL (unisync)');
    conn.release();
});

const md5 = (str) => crypto.createHash('md5').update(str).digest('hex');

// ── Auth ─────────────────────────────────────────────────

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email], (err, rows) => {
        if (err)          return res.status(500).json({ error: err.message });
        if (!rows.length) return res.status(401).json({ error: 'User not found.' });

        const user = rows[0];
        if (md5(password) !== user.password) return res.status(401).json({ error: 'Invalid password.' });

        res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
});

app.post('/api/signup', (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });

    db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, md5(password), role || 'student'],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY')
                    return res.status(409).json({ error: 'Email already in use.' });
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Account created.', id: result.insertId });
        }
    );
});

// ── Tutors ───────────────────────────────────────────────

app.get('/api/requests/tutors', (req, res) => {
    db.query('SELECT id, name, subject, rating, bio FROM tutors', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ── Tutoring Requests ────────────────────────────────────

app.get('/api/requests/student/:email', (req, res) => {
    db.query(
        'SELECT * FROM tutoring_requests WHERE student_email = ? ORDER BY created_at DESC',
        [req.params.email],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// GET pending requests for a tutor — both route styles supported
const tutorRequestsHandler = (req, res) => {
    db.query(
        'SELECT * FROM tutoring_requests WHERE tutor_id = ? AND status = "pending" ORDER BY created_at DESC',
        [req.params.tutorId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
};
app.get('/api/requests/tutor/:tutorId',           tutorRequestsHandler);
app.get('/api/requests/tutor-dashboard/:tutorId',  tutorRequestsHandler);

app.post('/api/requests', (req, res) => {
    const { student_name, student_email, tutor_id, course_code, topic, status } = req.body;
    if (!student_email || !tutor_id || !course_code)
        return res.status(400).json({ error: 'student_email, tutor_id, and course_code are required.' });

    db.query(
        'INSERT INTO tutoring_requests (student_name, student_email, tutor_id, course_code, topic, status) VALUES (?, ?, ?, ?, ?, ?)',
        [student_name, student_email, tutor_id, course_code, topic || 'General Discussion', status || 'pending'],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Request sent.', id: result.insertId });
        }
    );
});

// PUT update status — both route styles supported
const updateStatusHandler = (req, res) => {
    const { status } = req.body;
    if (!['accepted', 'rejected', 'pending'].includes(status))
        return res.status(400).json({ error: 'Invalid status.' });

    db.query(
        'UPDATE tutoring_requests SET status = ? WHERE id = ?',
        [status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Status updated.' });
        }
    );
};
app.put('/api/requests/:id',        updateStatusHandler);
app.put('/api/requests/:id/status', updateStatusHandler);

// ── Study Tasks ──────────────────────────────────────────

app.get('/api/tasks', (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id required.' });
    db.query(
        `SELECT * FROM study_tasks WHERE user_id = ?
         ORDER BY is_completed ASC, FIELD(priority,'high','medium','low'), deadline ASC`,
        [user_id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(r => ({ ...r, is_completed: !!r.is_completed })));
        }
    );
});

app.post('/api/tasks', (req, res) => {
    const { user_id, title, description, deadline, priority, plan_name } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title required.' });
    db.query(
        'INSERT INTO study_tasks (user_id, title, description, deadline, plan_name, priority, is_completed) VALUES (?, ?, ?, ?, ?, ?, 0)',
        [user_id, title.trim(), description || null, deadline || null, plan_name || null, priority || 'medium'],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, message: 'Task created.' });
        }
    );
});

app.put('/api/tasks/:id/toggle', (req, res) => {
    const { user_id } = req.body;
    db.query(
        `UPDATE study_tasks
         SET is_completed = NOT is_completed,
             completed_at = CASE WHEN is_completed = 0 THEN NOW() ELSE NULL END
         WHERE id = ? AND user_id = ?`,
        [req.params.id, user_id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Toggled.' });
        }
    );
});

app.delete('/api/tasks/:id', (req, res) => {
    const { user_id } = req.query;
    db.query('DELETE FROM study_tasks WHERE id = ? AND user_id = ?', [req.params.id, user_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted.' });
    });
});

// ─────────────────────────────────────────────────────────

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
