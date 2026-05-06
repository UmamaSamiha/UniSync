const db = require('../db');

const ResourceModel = {
  async createTable() {
    const sql = `CREATE TABLE IF NOT EXISTS resources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      subject VARCHAR(50) NOT NULL,
      semester VARCHAR(30),
      description TEXT,
      tags VARCHAR(255),
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_type VARCHAR(20) NOT NULL,
      file_size INT NOT NULL,
      uploader_id INT NOT NULL DEFAULT 1,
      uploader_name VARCHAR(100) DEFAULT 'Anonymous',
      downloads INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await db.execute(sql);
  },

  async create(data) {
    const sql = `INSERT INTO resources 
      (title, subject, semester, description, tags, filename, original_name, file_type, file_size, uploader_id, uploader_name) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      data.title, data.subject, data.semester, data.description,
      data.tags, data.filename, data.originalName, data.fileType,
      data.fileSize, data.uploaderId, data.uploaderName
    ]);
    return result.insertId;
  },

  async getAll({ subject = '', search = '', type = '' } = {}) {
    let sql = 'SELECT * FROM resources WHERE 1=1';
    const params = [];
    if (subject) { sql += ' AND subject = ?'; params.push(subject); }
    if (type) { sql += ' AND file_type = ?'; params.push(type); }
    if (search) { sql += ' AND (title LIKE ? OR subject LIKE ?)'; params.push('%' + search + '%', '%' + search + '%'); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.execute(sql, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.execute('SELECT * FROM resources WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async incrementDownloads(id) {
    await db.execute('UPDATE resources SET downloads = downloads + 1 WHERE id = ?', [id]);
  }
};

module.exports = ResourceModel;