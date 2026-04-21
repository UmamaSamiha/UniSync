const db = require('../../config/db');

class GroupPost {
// Get all posts for a group
    static async getByGroup(groupId) {
        const [rows] = await db.query(
            'SELECT * FROM group_posts WHERE group_id = ? ORDER BY created_at DESC',
            [groupId]
        );
        return rows;
}

// Create a new post
    static async create({ group_id, posted_by, type, title, content }) {
        const [result] = await db.query(
            'INSERT INTO group_posts (group_id, posted_by, type, title, content) VALUES (?, ?, ?, ?, ?)',
            [group_id, posted_by, type, title, content]
        );
        return result.insertId;
}
}

module.exports = GroupPost;