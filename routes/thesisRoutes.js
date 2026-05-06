const express = require('express');
const router = express.Router();
const db = require('../config/db');

/* ---------------------------
   Helper: Load Submit Page
---------------------------- */
async function loadSubmitPage(res, error = null, success = null) {
    try {
        const [faculty] = await db.query("SELECT * FROM faculty ORDER BY name ASC");

        res.render('thesis/submit', {
            faculty: faculty || [],
            error,
            success
        });
    } catch (err) {
        console.error(err);
        res.render('thesis/submit', {
            faculty: [],
            error: "Failed to load page",
            success: null
        });
    }
}

/* ---------------------------
   ROLE REDIRECTS
---------------------------- */
router.get('/student', (req, res) => {
    res.redirect('/thesis/submit');
});

router.get('/faculty', (req, res) => {
    res.redirect('/thesis/faculty');
});

/* ---------------------------
   SUBMIT PAGE (GET)
---------------------------- */
router.get('/submit', async (req, res) => {
    await loadSubmitPage(res);
});

/* ---------------------------
   SUBMIT PROPOSAL (POST)
---------------------------- */
router.post('/submit', async (req, res) => {
    try {
        const {
            title,
            description,
            subject_area,
            student_name,
            student_email,
            faculty_id
        } = req.body;

        if (!title || !description || !subject_area || !student_name || !student_email || !faculty_id) {
            return loadSubmitPage(res, "All fields are required");
        }

        const [existing] = await db.query(
            "SELECT id FROM students WHERE email = ?",
            [student_email]
        );

        let studentId;

        if (existing.length > 0) {
            studentId = existing[0].id;
        } else {
            const [result] = await db.query(
                "INSERT INTO students (name, email) VALUES (?, ?)",
                [student_name, student_email]
            );
            studentId = result.insertId;
        }

        if (!studentId) throw new Error("Student ID failed");

        await db.query(
            `INSERT INTO thesis_proposals
            (title, description, subject_area, student_id, faculty_id)
            VALUES (?, ?, ?, ?, ?)`,
            [title, description, subject_area, studentId, faculty_id]
        );

        await loadSubmitPage(res, null, "Proposal submitted successfully!");

    } catch (err) {
        console.error(err);
        await loadSubmitPage(res, "Database error occurred");
    }
});

/* ---------------------------
   MY PROPOSALS
---------------------------- */
router.get('/myproposals', async (req, res) => {
    try {
        const email = req.query.email || "";
        let proposals = [];
        let error = null;

        if (email) {
            const [students] = await db.query(
                "SELECT id FROM students WHERE email = ?",
                [email]
            );

            if (students.length === 0) {
                error = "No student found with that email.";
            } else {
                const [rows] = await db.query(
                    `SELECT tp.*,
                            f.name AS faculty_name,
                            f.department AS department
                     FROM thesis_proposals tp
                     LEFT JOIN faculty f ON tp.faculty_id = f.id
                     WHERE tp.student_id = ?
                     ORDER BY tp.submitted_at DESC`,
                    [students[0].id]
                );
                proposals = rows;
            }
        }

        res.render('thesis/myproposals', {
            proposals: proposals,
            email: email,
            error: error
        });

    } catch (err) {
        console.error(err);
        res.render('thesis/myproposals', {
            proposals: [],
            email: "",
            error: "Server error. Please try again."
        });
    }
});

/* ---------------------------
   FACULTY DASHBOARD (default)
   Shows ALL proposals all statuses
---------------------------- */
router.get('/faculty', async (req, res) => {
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
   FACULTY PROPOSALS BY ID
   Shows ALL statuses for that faculty
---------------------------- */
router.get('/faculty/:facultyId', async (req, res) => {
    try {
        const [facultyList] = await db.query("SELECT * FROM faculty ORDER BY name ASC");

        const selectedFaculty = facultyList.find(
            f => f.id == req.params.facultyId
        ) || null;

        if (!selectedFaculty) {
            return res.render('thesis/faculty_dashboard', {
                facultyList: facultyList || [],
                proposals: [],
                selectedFaculty: null,
                error: "Faculty member not found."
            });
        }

        const [proposals] = await db.query(
            `SELECT tp.*,
                    s.name AS student_name,
                    s.email AS student_email
             FROM thesis_proposals tp
             JOIN students s ON tp.student_id = s.id
             WHERE tp.faculty_id = ?
             ORDER BY tp.submitted_at DESC`,
            [req.params.facultyId]
        );

        res.render('thesis/faculty_dashboard', {
            facultyList: facultyList || [],
            proposals: proposals || [],
            selectedFaculty: selectedFaculty,
            error: null
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* ---------------------------
   PROPOSAL DETAIL
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

        if (!rows[0]) {
            return res.status(404).send("Proposal not found");
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

        res.render('thesis/proposal_detail', {
            proposal: rows[0],
            documents: documents || [],
            uploadError: null,
            uploadSuccess: null,
            error: null
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* ---------------------------
   REVIEW PROPOSAL (POST)
---------------------------- */
router.post('/proposal/:id/review', async (req, res) => {
    try {
        const { status, faculty_note } = req.body;

        if (!status || !['accepted', 'rejected'].includes(status)) {
            return res.status(400).send("Invalid status");
        }

        await db.query(
            `UPDATE thesis_proposals
             SET status = ?, faculty_note = ?, reviewed_at = NOW()
             WHERE id = ?`,
            [status, faculty_note || null, req.params.id]
        );

        res.redirect(`/thesis/proposal/${req.params.id}`);

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* ---------------------------
   DELETE REJECTED PROPOSAL (POST)
---------------------------- */
router.post('/proposal/:id/delete', async (req, res) => {
    try {
        // only allow deleting rejected proposals
        const [rows] = await db.query(
            `SELECT status FROM thesis_proposals WHERE id = ?`,
            [req.params.id]
        );

        if (!rows[0]) {
            return res.status(404).send("Proposal not found");
        }

        if (rows[0].status !== 'rejected') {
            return res.status(403).send("Only rejected proposals can be deleted");
        }

        // delete proposal — cascade will remove documents and feedback too
        await db.query(
            `DELETE FROM thesis_proposals WHERE id = ?`,
            [req.params.id]
        );

        // redirect back to faculty dashboard
        const referer = req.headers.referer || '';
        if (referer.includes('/faculty/')) {
            const match = referer.match(/\/faculty\/(\d+)/);
            if (match) {
                return res.redirect(`/thesis/faculty/${match[1]}`);
            }
        }

        res.redirect('/thesis/faculty');

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* ---------------------------
   ACCEPT PROPOSAL (POST)
---------------------------- */
router.post('/accept/:id', async (req, res) => {
    try {
        await db.query(
            `UPDATE thesis_proposals
             SET status = 'accepted', reviewed_at = NOW()
             WHERE id = ?`,
            [req.params.id]
        );
        res.redirect('/thesis/faculty');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

/* ---------------------------
   REJECT PROPOSAL (POST)
---------------------------- */
router.post('/reject/:id', async (req, res) => {
    try {
        await db.query(
            `UPDATE thesis_proposals
             SET status = 'rejected', reviewed_at = NOW()
             WHERE id = ?`,
            [req.params.id]
        );
        res.redirect('/thesis/faculty');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

module.exports = router;