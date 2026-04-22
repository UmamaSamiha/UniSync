const db = require('../db');

const createRequest = async (req, res) => {
    try {
        const { studentName, courseCode, topic } = req.body;
        
        // The SQL query to insert data
        const query = "INSERT INTO requests (studentName, courseCode, topic) VALUES (?, ?, ?)";
        
        // Execute the query using the data from the React form
        const [result] = await db.execute(query, [studentName, courseCode, topic]);

        res.status(201).json({ message: "✅ Request saved to MySQL successfully", id: result.insertId });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "❌ Error saving request" });
    }
};

const getTutors = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM tutors");
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tutors" });
    }
};

const sendTutorRequest = async (req, res) => {
    const { student_name, student_email, tutor_id, course_code } = req.body;
    
    try {
        const query = "INSERT INTO requests (student_name, student_email, tutor_id, course_code, status) VALUES (?, ?, ?, ?, 'pending')";
        await db.execute(query, [student_name, student_email, tutor_id, course_code]);
        res.status(201).json({ message: "✅ Request sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Failed to send request" });
    }
};

// Fetch pending requests for a specific tutor
const getTutorRequests = async (req, res) => {
    const tutorId = req.params.tutorId;
    try {
        const [rows] = await db.execute("SELECT * FROM requests WHERE tutor_id = ? AND status = 'pending'", [tutorId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Error fetching requests" });
    }
};

// Accept or Reject a request
const updateRequestStatus = async (req, res) => {
    const requestId = req.params.id;
    const { status } = req.body; // This will be either 'accepted' or 'rejected'
    
    try {
        await db.execute("UPDATE requests SET status = ? WHERE id = ?", [status, requestId]);
        res.status(200).json({ message: `✅ Request ${status} successfully!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Error updating status" });
    }
};

// Fetch all requests made by a specific student
const getStudentRequests = async (req, res) => {
    const email = req.params.email;
    try {
        const [rows] = await db.execute("SELECT * FROM requests WHERE student_email = ?", [email]);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Error fetching student requests" });
    }
};

module.exports = {
    createRequest, getTutors, sendTutorRequest, getTutorRequests, updateRequestStatus, getStudentRequests
};

