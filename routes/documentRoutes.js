const express = require('express');
const router = express.Router();
const documentController = require('../app/controllers/documentController');
const upload = require('../config/upload');

// List all documents for a proposal
router.get('/proposal/:proposalId', documentController.listDocuments);

// Upload form
router.get('/proposal/:proposalId/upload', documentController.showUploadForm);

// Upload document
router.post(
    '/proposal/:proposalId/upload',
    upload.single('file'),
    documentController.uploadDocument
);

// View single document
router.get('/:id', documentController.viewDocument);

// Add faculty feedback
router.post('/:id/feedback', documentController.addFeedback);

module.exports = router;
