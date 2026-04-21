const db = require('../../config/db');

class StudyGroup {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM study_groups ORDER BY created_at DESC');
      return rows;
    } catch (err) {
      console.error('DB ERROR in getAll:', err.message);
      throw err;
    }
  }

  static async create({ name, subject, description, created_by }) {
    const [result] = await db.query(
      'INSERT INTO study_groups (name, subject, description, created_by) VALUES (?, ?, ?, ?)',
      [name, subject, description, created_by]
    );
    return result.insertId;
  }

  static async getById(id) {
    const [rows] = await db.query(
      'SELECT * FROM study_groups WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

module.exports = StudyGroup;
