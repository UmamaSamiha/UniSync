const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const requestRoutes = require('./routes/requestRoutes');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/requests', requestRoutes);

mongoose.connect("mongodb://localhost:27017/unisync")
    .then(() => console.log("✅ MongoDB Connected!"))
    .catch(err => console.error("❌ Connection error:", err));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));