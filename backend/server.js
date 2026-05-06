const express = require('express');
const cors = require('cors');
const requestRoutes = require('./routes/requestRoutes');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/requests', requestRoutes);

app.listen(5000, () => console.log("🚀 Server running on port 5000"));