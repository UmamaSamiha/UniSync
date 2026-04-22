// routes/resourceRoutes.js
// All API routes for the Resource Sharing module
// Base path: /api/resources  (registered in app.js)

const express    = require('express');
const multer     = require('multer');
const path       = require('path');
const router     = express.Router();
const ResourceController = require('../controllers/resourceController');

// ── Multer storage config ──
// Files are saved to /public/uploads/ with a unique timestamp-based name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  }
});

// ── Multer file filter — allow only safe document types ──
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/zip',
    'application/x-zip-compressed'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PPTX, DOCX, and ZIP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }  // 50 MB limit
});

// ────────────────────────────────────────────
// ROUTES
// ────────────────────────────────────────────

// GET  /api/resources          → list all resources (with optional filters)
router.get('/', ResourceController.getAll);

// GET  /api/resources/search   → search resources by query/subject/type
router.get('/search', ResourceController.search);

// POST /api/resources/upload   → upload a new resource (multipart/form-data)
router.post('/upload', upload.single('file'), ResourceController.upload);

// GET  /api/resources/:id/download → download a specific resource
router.get('/:id/download', ResourceController.download);

// ── Multer error handler ──
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50 MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) return res.status(400).json({ error: err.message });
  next();
});

