const path = require('path');
const fs = require('fs');
const ResourceModel = require('../models/resourceModel');

const ResourceController = {
  async upload(req, res) {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
      const { title, subject, semester, description, tags } = req.body;
      if (!title) return res.status(400).json({ error: 'Title is required.' });
      if (!subject) return res.status(400).json({ error: 'Subject is required.' });
      const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
      const resourceId = await ResourceModel.create({
        title: title.trim(),
        subject: subject.trim(),
        semester: semester || null,
        description: description || null,
        tags: tags || null,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType: ext,
        fileSize: req.file.size,
        uploaderId: 1,
        uploaderName: 'Anonymous'
      });
      return res.status(201).json({ message: 'Uploaded successfully.', resourceId });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error.' });
    }
  },

  async getAll(req, res) {
    try {
      const { subject, type } = req.query;
      const resources = await ResourceModel.getAll({ subject, type });
      return res.json(resources);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not fetch resources.' });
    }
  },

  async download(req, res) {
    try {
      const resource = await ResourceModel.getById(req.params.id);
      if (!resource) return res.status(404).json({ error: 'Not found.' });
      const filePath = path.join(__dirname, '..', 'public', 'uploads', resource.filename);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found.' });
      await ResourceModel.incrementDownloads(resource.id);
      res.download(filePath, resource.original_name);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not download.' });
    }
  },

  async search(req, res) {
    try {
      const { q = '', subject = '', type = '' } = req.query;
      const results = await ResourceModel.getAll({ search: q, subject, type });
      return res.json(results);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Search failed.' });
    }
  }
};

module.exports = ResourceController;