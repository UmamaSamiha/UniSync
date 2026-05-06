const db = require('../../config/db');

class ThesisProposal {

  static async getAllFaculty() {
    const [rows] = await db.query(
      `SELECT * FROM faculty ORDER BY name ASC`
    );
    return rows || [];
  }

  static async create(data) {
    const [result] = await db.query(
      `INSERT INTO thesis_proposals
      (title, description, subject_area, student_id, faculty_id)
      VALUES (?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description,
        data.subject_area,
        data.student_id,
        data.faculty_id
      ]
    );

    return result.insertId;
  }

  static async getByStudent(studentId) {
    const [rows] = await db.query(
      `SELECT tp.*, f.name AS faculty_name, f.department
       FROM thesis_proposals tp
       JOIN faculty f ON tp.faculty_id = f.id
       WHERE tp.student_id = ?
       ORDER BY tp.submitted_at DESC`,
      [studentId]
    );

    return rows || [];
  }

  static async getByFaculty(facultyId) {
    const [rows] = await db.query(
      `SELECT tp.*, s.name AS student_name, s.email AS student_email
       FROM thesis_proposals tp
       JOIN students s ON tp.student_id = s.id
       WHERE tp.faculty_id = ?
       ORDER BY tp.submitted_at DESC`,
      [facultyId]
    );

    return rows || [];
  }

  static async getById(id) {
    const [rows] = await db.query(
      `SELECT tp.*,
              s.name AS student_name,
              s.email AS student_email,
              f.name AS faculty_name
       FROM thesis_proposals tp
       JOIN students s ON tp.student_id = s.id
       JOIN faculty f ON tp.faculty_id = f.id
       WHERE tp.id = ?`,
      [id]
    );

    return rows?.[0] || null;
  }

  static async updateStatus(id, status, note) {
    const [result] = await db.query(
      `UPDATE thesis_proposals
       SET status = ?, faculty_note = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [status, note, id]
    );

    return result;
  }
}

module.exports = ThesisProposal;