const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const thesisRoutes = require('./routes/thesisRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const documentRoutes = require('./routes/documentRoutes');
const studentRoutes = require('./routes/studentRoutes'); // ← ADD THIS

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/thesis', thesisRoutes);
app.use('/faculty', facultyRoutes);
app.use('/documents', documentRoutes);
app.use('/student', studentRoutes); // ← ADD THIS

// Role select page
app.get('/', (req, res) => {
    res.render('role-select');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});