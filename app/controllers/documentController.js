const ThesisDocument = require('../models/ThesisDocument');
const DocumentFeedback = require('../models/DocumentFeedback');
const db = require('../../config/db');

const documentController = {

  // LIST DOCUMENTS
  listDocuments: async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT * FROM thesis_proposals WHERE id = ?`,
        [req.params.proposalId]
      );

      const proposal = rows[0];

      if (!proposal) {
        return res.status(404).send("Proposal not found");
      }

      const documents = await ThesisDocument.getByProposal(req.params.proposalId);

      res.render('documents/document_list', {
        proposal: proposal,
        documents: documents || [],
        success: null,
        error: null
      });

    } catch (err) {
      console.error("LIST ERROR:", err);
      res.status(500).send("Server error");
    }
  },

  // SHOW UPLOAD FORM
  showUploadForm: async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT * FROM thesis_proposals WHERE id = ?`,
        [req.params.proposalId]
      );

      if (!rows[0]) {
        return res.status(404).send("Proposal not found");
      }

      res.render('documents/upload_form', {
        proposal: rows[0],
        error: null
      });

    } catch (err) {
      console.error("UPLOAD FORM ERROR:", err);
      res.status(500).send("Server error");
    }
  },

  // UPLOAD DOCUMENT
  uploadDocument: async (req, res) => {
    try {
      if (!req.file) {
        const [rows] = await db.query(
          `SELECT * FROM thesis_proposals WHERE id = ?`,
          [req.params.proposalId]
        );
        return res.render('documents/upload_form', {
          proposal: rows[0] || null,
          error: "No file uploaded. Please select a PDF file."
        });
      }

      const [rows] = await db.query(
        `SELECT * FROM thesis_proposals WHERE id = ?`,
        [req.params.proposalId]
      );

      const proposal = rows[0];

      if (!proposal) {
        return res.status(404).send("Proposal not found");
      }

      const versionLabel = await ThesisDocument.getNextVersion(req.params.proposalId);

      await ThesisDocument.create({
        proposalId: req.params.proposalId,
        studentId: proposal.student_id,
        versionLabel,
        originalFilename: req.file.originalname,
        storedFilename: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });

      res.redirect(`/documents/proposal/${req.params.proposalId}`);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).send("Server error");
    }
  },

  // VIEW DOCUMENT
  viewDocument: async (req, res) => {
    try {
      const document = await ThesisDocument.getById(req.params.id);

      if (!document) {
        return res.status(404).send("Document not found");
      }

      const feedback = await DocumentFeedback.getByDocument(req.params.id);
      const [facultyRows] = await db.query(`SELECT * FROM faculty ORDER BY name ASC`);

      res.render('documents/document_view', {
        document,
        feedback: feedback || [],
        facultyList: facultyRows || [],
        error: null,
        success: null
      });

    } catch (err) {
      console.error("VIEW ERROR:", err);
      res.status(500).send("Server error");
    }
  },

  // ADD FEEDBACK
  addFeedback: async (req, res) => {
    try {
      const { faculty_id, comment } = req.body;

      if (!faculty_id || !comment || comment.trim() === '') {
        const document = await ThesisDocument.getById(req.params.id);
        const feedback = await DocumentFeedback.getByDocument(req.params.id);
        const [facultyRows] = await db.query(`SELECT * FROM faculty ORDER BY name ASC`);

        return res.render('documents/document_view', {
          document,
          feedback: feedback || [],
          facultyList: facultyRows || [],
          error: "Please select a faculty member and enter a comment.",
          success: null
        });
      }

      await DocumentFeedback.create(
        req.params.id,
        faculty_id,
        comment.trim()
      );

      res.redirect(`/documents/${req.params.id}`);

    } catch (err) {
      console.error("FEEDBACK ERROR:", err);
      res.status(500).send("Server error");
    }
  }

};
module.exports = documentController;