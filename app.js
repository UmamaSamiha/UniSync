const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));

const resourceRoutes = require('./routes/resourceRoutes');
app.use('/api/resources', resourceRoutes);

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ResourceModel = require('./models/resourceModel');
ResourceModel.createTable()
  .then(() => console.log('Resources table ready'))
  .catch(err => console.error('Table creation failed:', err));

const PORT = 3000;
app.listen(PORT, () => {
  console.log('UNISYNC running at http://localhost:' + PORT);
});