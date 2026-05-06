const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

/* ---------------------------
   FACULTY DASHBOARD
---------------------------- */
router.get('/dashboard', async (req, res) => {
    try {
        const [facultyList] = await db.query("SELECT * FROM faculty ORDER BY name ASC");

        const [proposals] = await db.query(
            `SELECT tp.*,
                    s.name AS student_name,
                    s.email AS student_email
             FROM thesis_proposals tp
             JOIN students s ON tp.student_id = s.id
             ORDER BY tp.submitted_at DESC`
        );

        res.render('thesis/faculty_dashboard', {
            facultyList: facultyList || [],
            proposals: proposals || [],
            selectedFaculty: null,
            error: null
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* ---------------------------
   FACULTY PROPOSALS LIST
---------------------------- */
router.get('/proposals', async (req, res) => {
    try {
        const [facultyList] = await db.query("SELECT * FROM faculty ORDER BY name ASC");

        const [rows] = await db.query(
            `SELECT tp.*,
                    s.name AS student_name,
                    s.email AS student_email
             FROM thesis_proposals tp
             JOIN students s ON tp.student_id = s.id
             ORDER BY tp.submitted_at DESC`
        );

        res.render('thesis/faculty_dashboard', {
            facultyList: facultyList || [],
            proposals: rows || [],
            selectedFaculty: null,
            error: null
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* ---------------------------
   FACULTY VIEW STUDENT DOCS
   + ADD FEEDBACK
---------------------------- */
router.get('/proposal/:id/docs', async (req, res) => {
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

        const [facultyList] = await db.query("SELECT * FROM faculty ORDER BY name ASC");

        res.render('faculty/proposal_docs', {
            proposal: rows[0],
            documents: documents || [],
            facultyList: facultyList || [],
            success: null,
            error: null
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* ---------------------------
   FACULTY SUBMIT FEEDBACK
---------------------------- */
router.post('/proposal/:id/feedback/:docId', async (req, res) => {
    try {
        const { faculty_id, comment } = req.body;

        if (!faculty_id || !comment || comment.trim() === '') {
            return res.redirect(303, `/faculty/proposal/${req.params.id}/docs`);
        }

        await db.query(
            `INSERT INTO document_feedback (document_id, faculty_id, comment)
             VALUES (?, ?, ?)`,
            [req.params.docId, faculty_id, comment.trim()]
        );

        res.redirect(303, `/faculty/proposal/${req.params.id}/docs`);

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* ---------------------------
   ACCEPT PROPOSAL
---------------------------- */
router.post('/accept/:id', async (req, res) => {
    try {
        await db.query(
            `UPDATE thesis_proposals
             SET status = 'accepted', reviewed_at = NOW()
             WHERE id = ?`,
            [req.params.id]
        );
        res.redirect(303, '/faculty/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

/* ---------------------------
   REJECT PROPOSAL
---------------------------- */
router.post('/reject/:id', async (req, res) => {
    try {
        await db.query(
            `UPDATE thesis_proposals
             SET status = 'rejected', reviewed_at = NOW()
             WHERE id = ?`,
            [req.params.id]
        );
        res.redirect(303, '/faculty/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

/* ---------------------------
   DELETE REJECTED PROPOSAL
---------------------------- */
router.post('/delete/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT status FROM thesis_proposals WHERE id = ?`,
            [req.params.id]
        );

        if (!rows[0]) return res.status(404).send("Proposal not found");
        if (rows[0].status !== 'rejected') {
            return res.status(403).send("Only rejected proposals can be deleted");
        }

        await db.query(`DELETE FROM thesis_proposals WHERE id = ?`, [req.params.id]);

        res.redirect(303, '/faculty/dashboard');

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

module.exports = router;