const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/requestRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// THE FIX: Mount all routes strictly to '/api'
app.use('/api', apiRoutes);

const db = require('./db'); // Ensure your DB connects
app.listen(5000, () => console.log("🚀 Server running on port 5000"));