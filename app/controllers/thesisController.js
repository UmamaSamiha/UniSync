const ThesisProposal = require('../models/ThesisProposal');
const db = require('../../config/db');

const thesisController = {

  // GET submit form
  showSubmitForm: async (req, res) => {
    try {
      const faculty = await ThesisProposal.getAllFaculty();

      res.render('thesis/submit', {
        faculty: faculty || [],
        error: null,
        success: null
      });

    } catch (err) {
      console.error("FORM ERROR:", err);
      res.render('thesis/submit', {
        faculty: [],
        error: "Failed to load faculty",
        success: null
      });
    }
  },

  // POST submit proposal
  submit: async (req, res) => {
    const {
      title,
      description,
      subject_area,
      student_name,
      student_email,
      faculty_id
    } = req.body;

    try {
      // 1. Validate input
      if (!title || !description || !subject_area || !student_name || !student_email || !faculty_id) {
        const faculty = await ThesisProposal.getAllFaculty();

        return res.render('thesis/submit', {
          faculty: faculty || [],
          error: "All fields are required",
          success: null
        });
      }

      // 2. Find existing student
      const [existingRows] = await db.query(
        `SELECT id FROM students WHERE email = ?`,
        [student_email]
      );

      let studentId = null;

      // 3. If exists
      if (existingRows.length > 0) {
        studentId = existingRows[0].id;
      }

      // 4. If not exist → create
      else {
        const [insertResult] = await db.query(
          `INSERT INTO students (name, email) VALUES (?, ?)`,
          [student_name, student_email]
        );

        studentId = insertResult.insertId;
      }

      // 5. HARD SAFETY CHECK
      if (!studentId) {
        throw new Error("Student ID generation failed");
      }

      if (!faculty_id) {
        throw new Error("Faculty ID missing");
      }

      // 6. Insert thesis proposal
      await ThesisProposal.create({
        title,
        description,
        subject_area,
        student_id: studentId,
        faculty_id
      });

      const faculty = await ThesisProposal.getAllFaculty();

      return res.render('thesis/submit', {
        faculty: faculty || [],
        error: null,
        success: "Proposal submitted successfully!"
      });

    } catch (err) {
      console.error("SUBMIT ERROR:", err);

      const faculty = await ThesisProposal.getAllFaculty();

      return res.render('thesis/submit', {
        faculty: faculty || [],
        error: "Something went wrong while submitting proposal",
        success: null
      });
    }
  },

  // My proposals
  myProposals: async (req, res) => {
    const { email } = req.query;

    try {
      if (!email) {
        return res.render('thesis/myproposals', {
          proposals: [],
          email: null,
          error: null
        });
      }

      const [students] = await db.query(
        `SELECT id FROM students WHERE email = ?`,
        [email]
      );

      if (students.length === 0) {
        return res.render('thesis/myproposals', {
          proposals: [],
          email,
          error: "Student not found"
        });
      }

      const proposals = await ThesisProposal.getByStudent(students[0].id);

      res.render('thesis/myproposals', {
        proposals,
        email,
        error: null
      });

    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  // Faculty selector
  showFacultySelector: async (req, res) => {
    try {
      const facultyList = await ThesisProposal.getAllFaculty();

      res.render('thesis/faculty_dashboard', {
        facultyList: facultyList || [],
        proposals: null,
        selectedFaculty: null,
        error: null
      });

    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  // Faculty proposals
  showProposals: async (req, res) => {
    try {
      const facultyList = await ThesisProposal.getAllFaculty();
      const proposals = await ThesisProposal.getByFaculty(req.params.facultyId);

      const selectedFaculty =
        facultyList.find(f => f.id == req.params.facultyId) || null;

      res.render('thesis/faculty_dashboard', {
        facultyList: facultyList || [],
        proposals: proposals || [],
        selectedFaculty,
        error: null
      });

    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  // Proposal detail
  showProposal: async (req, res) => {
    try {
      const ThesisDocument = require('../models/ThesisDocument');
      const DocumentFeedback = require('../models/DocumentFeedback');

      const proposal = await ThesisProposal.getById(req.params.id);
      const documents = await ThesisDocument.getByProposal(req.params.id);

      for (let doc of documents) {
        doc.feedback = await DocumentFeedback.getByDocument(doc.id);
      }

      res.render('thesis/proposal_detail', {
        proposal,
        documents,
        error: null
      });

    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  // Review proposal
  reviewProposal: async (req, res) => {
    try {
      await ThesisProposal.updateStatus(
        req.params.id,
        req.body.status,
        req.body.faculty_note
      );

      res.redirect(`/thesis/proposal/${req.params.id}`);

    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }

};
module.exports = thesisController;