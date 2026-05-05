const db = require('../../config/db');

class GroupMember {
  static async getByGroup(groupId) {
    const [rows] = await db.query(
      'SELECT * FROM group_members WHERE group_id = ? ORDER BY joined_at ASC',
      [groupId]
    );
    return rows;
  }

  static async isMember(groupId, studentId) {
    const [rows] = await db.query(
      'SELECT * FROM group_members WHERE group_id = ? AND student_id = ?',
      [groupId, studentId]
    );
    return rows.length > 0;
  }

  static async join({ group_id, student_name, student_id, email, contact, major, semester, subject_interest }) {
    const [result] = await db.query(
      `INSERT INTO group_members 
        (group_id, student_name, student_id, email, contact, major, semester, subject_interest) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [group_id, student_name, student_id, email, contact, major, semester, subject_interest]
    );
    return result.insertId;
  }
}

module.exports = GroupMember;