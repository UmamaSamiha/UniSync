// models/resourceModel.js
// Handles all database queries for the Resource Sharing module
// Uses MySQL2 promise-based API

const db = require('../db');

const ResourceModel = {

  // ── Create the resources table if it doesn't exist ──
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS resources (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        title       VARCHAR(100)  NOT NULL,
        subject     VARCHAR(50)   NOT NULL,
        semester    VARCHAR(30),
        description TEXT,
        tags        VARCHAR(255),
        filename    VARCHAR(255)  NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_type   VARCHAR(20)   NOT NULL,
        file_size   INT           NOT NULL,
        uploader_id INT           NOT NULL,
        uploader_name VARCHAR(100),
        downloads   INT DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.execute(sql);
    console.log('✅ resources table ready');
  },

  // ── Insert a new resource record ──
  async create({ title, subject, semester, description, tags,
                 filename, originalName, fileType, fileSize,
                 uploaderId, uploaderName }) {
    const sql = `
      INSERT INTO resources
        (title, subject, semester, description, tags,
         filename, original_name, file_type, file_size,
         uploader_id, uploader_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      title, subject, semester || null, description || null,
      tags || null, filename, originalName, fileType, fileSize,
      uploaderId, uploaderName || null
    ]);
    return result.insertId;
  },

  // ── Get all resources (optional subject + search filter) ──
  async getAll({ subject = '', search = '', type = '' } = {}) {
    let sql = `SELECT * FROM resources WHERE 1=1`;
    const params = [];

    if (subject) {
      sql += ` AND subject = ?`;
      params.push(subject);
    }
    if (type) {
      sql += ` AND file_type = ?`;
      params.push(type);
    }
    if (search) {
      sql += ` AND (title LIKE ? OR subject LIKE ? OR tags LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql, params);
    return rows;
  },

  // ── Get a single resource by ID ──
  async getById(id) {
    const [rows] = await db.execute(
      `SELECT * FROM resources WHERE id = ?`, [id]
    );
    return rows[0] || null;
  },

  // ── Increment download count ──
  async incrementDownloads(id) {
    await db.execute(
      `UPDATE resources SET downloads = downloads + 1 WHERE id = ?`, [id]
    );
  },

  // ── Delete a resource (by owner) ──
  async delete(id, uploaderId) {
    const [result] = await db.execute(
      `DELETE FROM resources WHERE id = ? AND uploader_id = ?`,
      [id, uploaderId]
    );
    return result.affectedRows > 0;
  }
};

