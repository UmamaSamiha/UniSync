const db = require('../../config/db');

class ThesisDocument {

  // CREATE DOCUMENT
  static async create(data) {
    const {
      proposalId,
      studentId,
      versionLabel,
      originalFilename,
      storedFilename,
      filePath,
      fileSize,
      mimeType
    } = data;

    // strict validation
    if (!proposalId || !studentId) {
      throw new Error("proposalId and studentId are required");
    }

    if (!originalFilename || !storedFilename || !filePath) {
      throw new Error("File information is incomplete");
    }

    const [result] = await db.query(
      `INSERT INTO thesis_documents 
      (proposal_id, student_id, version_label, original_filename, stored_filename, file_path, file_size, mime_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        proposalId,
        studentId,
        versionLabel || 'v1',
        originalFilename,
        storedFilename,
        filePath,
        fileSize || 0,
        mimeType || null
      ]
    );

    return result.insertId;
  }

  // GET BY PROPOSAL
  static async getByProposal(proposalId) {
    const [rows] = await db.query(
      `SELECT * 
       FROM thesis_documents 
       WHERE proposal_id = ? 
       ORDER BY uploaded_at DESC`,
      [proposalId]
    );

    return rows || [];
  }

  // GET BY ID
  static async getById(id) {
    const [rows] = await db.query(
      `SELECT * FROM thesis_documents WHERE id = ?`,
      [id]
    );

    return rows?.[0] || null;
  }

  // NEXT VERSION
  static async getNextVersion(proposalId) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS count 
       FROM thesis_documents 
       WHERE proposal_id = ?`,
      [proposalId]
    );

    const count = Number(rows?.[0]?.count || 0);

    return `v${count + 1}`;
  }
}

module.exports = ThesisDocument;