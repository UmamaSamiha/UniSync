// app.js  (add these lines to your group's existing app.js)
// ─────────────────────────────────────────────────────────
// This file shows ONLY the lines you need to ADD.
// Do NOT replace your teammates' code — just add your section.

const express        = require('express');
const path           = require('path');
const app            = express();

// ── Body parsers ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve static files (HTML, CSS, JS, uploaded files) ──
app.use(express.static(path.join(__dirname, 'public')));

// ── ✅ YOUR PART: Register resource routes ──
const resourceRoutes = require('./routes/resourceRoutes');
app.use('/api/resources', resourceRoutes);

// ── Create uploads folder if it doesn't exist ──
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// ── Initialize database table on startup ──
const ResourceModel = require('./models/resourceModel');
ResourceModel.createTable().catch(console.error);

// ── Start server ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 UNISYNC running at http://localhost:${PORT}`);
