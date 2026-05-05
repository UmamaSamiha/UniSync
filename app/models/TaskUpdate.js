const db = require('../../config/db');

class TaskUpdate {
  static async getByPost(postId) {
    const [rows] = await db.query(
      'SELECT * FROM task_updates WHERE post_id = ? ORDER BY updated_at DESC',
      [postId]
    );
    return rows;
  }

  static async create({ post_id, updated_by, old_status, new_status, note }) {
    const [result] = await db.query(
      `INSERT INTO task_updates (post_id, updated_by, old_status, new_status, note)
       VALUES (?, ?, ?, ?, ?)`,
      [post_id, updated_by, old_status, new_status, note || null]
    );
    return result.insertId;
  }
}

module.exports = TaskUpdate;