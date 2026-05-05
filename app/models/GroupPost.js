const db = require('../../config/db');

class GroupPost {
  static async getByGroup(groupId) {
    const [rows] = await db.query(
      'SELECT * FROM group_posts WHERE group_id = ? ORDER BY created_at DESC',
      [groupId]
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(
      'SELECT * FROM group_posts WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create({ group_id, posted_by, type, title, content, assigned_to, due_date }) {
    const [result] = await db.query(
      `INSERT INTO group_posts 
        (group_id, posted_by, type, title, content, assigned_to, due_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [group_id, posted_by, type, title, content, assigned_to || null, due_date || null]
    );
    return result.insertId;
  }

  static async updateStatus(id, status) {
    await db.query(
      'UPDATE group_posts SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  static async getTasksByMember(groupId, memberName) {
    const [rows] = await db.query(
      `SELECT * FROM group_posts 
       WHERE group_id = ? AND type = 'task' AND assigned_to = ?
       ORDER BY due_date ASC`,
      [groupId, memberName]
    );
    return rows;
  }
}

module.exports = GroupPost;