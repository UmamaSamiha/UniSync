const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const studyGroupRoutes = require('./routes/studyGroupRoutes');
app.use('/study-groups', studyGroupRoutes);

// Root redirect
app.get('/', (req, res) => res.redirect('/study-groups'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`UniSync running at http://localhost:${PORT}`);
});