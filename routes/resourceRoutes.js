const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const ResourceController = require('../controllers/resourceController');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/', ResourceController.getAll);
router.get('/search', ResourceController.search);
router.post('/upload', upload.single('file'), ResourceController.upload);
router.get('/:id/download', ResourceController.download);

module.exports = router;