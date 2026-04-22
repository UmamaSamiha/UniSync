// controllers/resourceController.js
// Business logic for all Resource Sharing features

const path = require('path');
const fs   = require('fs');
const ResourceModel = require('../models/resourceModel');

const ResourceController = {

  // ────────────────────────────────────────────
  // FEATURE 1 — Upload study materials (POST /api/resources/upload)
  // ────────────────────────────────────────────
  async upload(req, res) {
    try {
      // multer puts the file on req.file and text fields on req.body
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      const { title, subject, semester, description, tags } = req.body;

      if (!title || !subject) {
        return res.status(400).json({ error: 'Title and subject are required.' });
      }

      // Determine file type from extension
      const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();

      // Save record to database
      const resourceId = await ResourceModel.create({
        title:        title.trim(),
        subject:      subject.trim(),
        semester:     semester || null,
        description:  description || null,
        tags:         tags || null,
        filename:     req.file.filename,         // stored name on disk
        originalName: req.file.originalname,     // original upload name
        fileType:     ext,
        fileSize:     req.file.size,
        uploaderId:   req.session?.userId || 1,  // from session when auth is set up
        uploaderName: req.session?.userName || 'Anonymous'
      });

      return res.status(201).json({
        message:    'Resource uploaded successfully.',
        resourceId
      });

    } catch (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Server error during upload.' });
    }
  },

  // ────────────────────────────────────────────
  // FEATURE 2 — View shared resources (GET /api/resources)
  // ────────────────────────────────────────────
  async getAll(req, res) {
    try {
      const { subject, search, type } = req.query;
      const resources = await ResourceModel.getAll({ subject, search, type });
      return res.json(resources);

    } catch (err) {
      console.error('getAll error:', err);
      return res.status(500).json({ error: 'Could not fetch resources.' });
    }
  },

  // ────────────────────────────────────────────
  // FEATURE 3 — Download a resource (GET /api/resources/:id/download)
  // ────────────────────────────────────────────
  async download(req, res) {
    try {
      const resource = await ResourceModel.getById(req.params.id);

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found.' });
      }

      const filePath = path.join(__dirname, '..', 'public', 'uploads', resource.filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File no longer exists on the server.' });
      }

      // Increment download counter
      await ResourceModel.incrementDownloads(resource.id);

      // Send file to browser as a download
      res.download(filePath, resource.original_name);

    } catch (err) {
      console.error('Download error:', err);
      return res.status(500).json({ error: 'Could not download file.' });
    }
  },

  // ────────────────────────────────────────────
  // FEATURE 4 — Search resources by subject (GET /api/resources/search?q=&subject=)
  // ────────────────────────────────────────────
  async search(req, res) {
    try {
      const { q = '', subject = '', type = '' } = req.query;

      if (!q && !subject && !type) {
        return res.status(400).json({ error: 'Please provide at least one search parameter.' });
      }

      const results = await ResourceModel.getAll({ search: q, subject, type });
      return res.json(results);

    } catch (err) {
      console.error('Search error:', err);
      return res.status(500).json({ error: 'Search failed.' });
    }
  }
};

