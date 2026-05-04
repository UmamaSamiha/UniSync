const db = require('../db');

// Send a tutoring request
const sendTutorRequest = async (req, res) => {
    const { student_name, student_email, tutor_id, course_code, topic } = req.body;
    
    try {
        const query = `
            INSERT INTO requests (student_name, student_email, tutor_id, course_code, topic, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')
        `;
        await db.execute(query, [
            student_name, 
            student_email, 
            tutor_id, 
            course_code, 
            topic || "General Discussion"
        ]);

        res.status(201).json({ message: "✅ Request sent successfully!" });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: "❌ Failed to send request. Check column names." });
    }
};

// Fetch list of available tutors
const getTutors = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM tutors");
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tutors" });
    }
};

// Fetch requests sent TO a specific tutor (Tutor View)
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
    const { status } = req.body; 
    
    try {
        await db.execute("UPDATE requests SET status = ? WHERE id = ?", [status, requestId]);
        res.status(200).json({ message: `✅ Request ${status} successfully!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Error updating status" });
    }
};

// Fetch requests made BY a specific student (Student View)
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

// Register a new tutor
const registerTutor = async (req, res) => {
    const { name, subject, bio } = req.body;
    try {
        await db.execute(
            "INSERT INTO tutors (name, subject, rating, bio) VALUES (?, ?, ?, ?)", 
            [name, subject, 5.0, bio]
        );
        res.status(201).json({ message: "✅ Successfully registered as a tutor!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Error registering tutor." });
    }
};

// Basic Login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
        if (users.length > 0) {
            res.status(200).json({ message: "Login Successful", user: users[0] });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getTutors, 
    sendTutorRequest, 
    getTutorRequests, 
    updateRequestStatus, 
    getStudentRequests, 
    registerTutor, 
    loginUser
};