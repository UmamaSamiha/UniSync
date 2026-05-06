const express = require('express');
const router = express.Router();
const db = require('../config/db');
const upload = require('../config/upload');

router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

/* ---------------------------
   STUDENT VIEW PROPOSAL DOCS
---------------------------- */
router.get('/proposal/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT tp.*,
                    s.name AS student_name,
                    s.email AS student_email,
                    f.name AS faculty_name
             FROM thesis_proposals tp
             JOIN students s ON tp.student_id = s.id
             JOIN faculty f ON tp.faculty_id = f.id
             WHERE tp.id = ?`,
            [req.params.id]
        );

        if (!rows[0]) return res.status(404).send("Proposal not found");
        if (rows[0].status !== 'accepted') {
            return res.status(403).send("Documents only available for accepted proposals");
        }

        const [documents] = await db.query(
            `SELECT * FROM thesis_documents
             WHERE proposal_id = ?
             ORDER BY uploaded_at DESC`,
            [req.params.id]
        );

        for (let doc of documents) {
            const [feedback] = await db.query(
                `SELECT df.*, f.name AS faculty_name, f.department
                 FROM document_feedback df
                 JOIN faculty f ON df.faculty_id = f.id
                 WHERE df.document_id = ?
                 ORDER BY df.created_at DESC`,
                [doc.id]
            );
            doc.feedback = feedback || [];
        }

        res.render('student/proposal_docs', {
            proposal: rows[0],
            documents: documents || [],
            success: null,
            error: null
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* ---------------------------
   STUDENT UPLOAD DOCUMENT
---------------------------- */
router.post('/proposal/:id/upload', upload.single('file'), async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT tp.*,
                    s.name AS student_name,
                    s.email AS student_email,
                    f.name AS faculty_name
             FROM thesis_proposals tp
             JOIN students s ON tp.student_id = s.id
             JOIN faculty f ON tp.faculty_id = f.id
             WHERE tp.id = ?`,
            [req.params.id]
        );

        if (!rows[0]) return res.status(404).send("Proposal not found");

        const proposal = rows[0];

        if (!req.file) {
            const [documents] = await db.query(
                `SELECT * FROM thesis_documents WHERE proposal_id = ? ORDER BY uploaded_at DESC`,
                [req.params.id]
            );
            for (let doc of documents) {
                const [feedback] = await db.query(
                    `SELECT df.*, f.name AS faculty_name, f.department
                     FROM document_feedback df
                     JOIN faculty f ON df.faculty_id = f.id
                     WHERE df.document_id = ?
                     ORDER BY df.created_at DESC`,
                    [doc.id]
                );
                doc.feedback = feedback || [];
            }
            return res.render('student/proposal_docs', {
                proposal,
                documents: documents || [],
                success: null,
                error: "No file uploaded. Please select a PDF."
            });
        }

        // get next version label
        const [countRows] = await db.query(
            `SELECT COUNT(*) AS count FROM thesis_documents WHERE proposal_id = ?`,
            [req.params.id]
        );
        const versionLabel = `v${Number(countRows[0].count) + 1}`;

        await db.query(
            `INSERT INTO thesis_documents
             (proposal_id, student_id, version_label, original_filename,
              stored_filename, file_path, file_size, mime_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.params.id,
                proposal.student_id,
                versionLabel,
                req.file.originalname,
                req.file.filename,
                req.file.path,
                req.file.size,
                req.file.mimetype
            ]
        );

        res.redirect(303, `/student/proposal/${req.params.id}`);

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

module.exports = router;