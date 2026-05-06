const db = require('../../config/db');

class DocumentFeedback {

  static async create(documentId, facultyId, comment) {
    const [result] = await db.query(
      `INSERT INTO document_feedback (document_id, faculty_id, comment)
       VALUES (?, ?, ?)`,
      [documentId, facultyId, comment]
    );

    return result.insertId;
  }

  static async getByDocument(documentId) {
    const [rows] = await db.query(
      `SELECT df.*, f.name AS faculty_name, f.department
       FROM document_feedback df
       JOIN faculty f ON df.faculty_id = f.id
       WHERE df.document_id = ?
       ORDER BY df.created_at DESC`,
      [documentId]
    );

    return rows || [];
  }
}

module.exports = DocumentFeedback;