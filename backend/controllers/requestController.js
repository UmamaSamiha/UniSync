const db = require('../db');

const createRequest = async (req, res) => {
    // 1. Get the data from the frontend
    const { student_name, student_email, course_code, tutor_id } = req.body;

    try {
        // 2. The SQL query must match your phpMyAdmin column names exactly
        // Based on your screenshot, your columns are: studentName, courseCode, status, tutor_id, student_email
        const query = `
            INSERT INTO requests (studentName, student_email, courseCode, status, tutor_id) 
            VALUES (?, ?, ?, 'Pending', ?)
        `;

        // 3. Pass the variables in the EXACT same order as the question marks
        await db.execute(query, [student_name, student_email, course_code, tutor_id]);

        res.status(201).json({ message: "✅ Request sent successfully!" });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: "❌ Error saving request to database." });
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

// Register a new tutor
const registerTutor = async (req, res) => {
    const { name, subject, bio } = req.body;
    
    try {
        // We will default their starting rating to 5.0 so they look good on the dashboard!
        await db.execute(
            "INSERT INTO tutors (name, subject, rating, bio) VALUES (?, ?, ?, ?)", 
            [name, subject, 5.0, bio]
        );
        res.status(201).json({ message: "✅ Successfully registered as a tutor!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Error registering tutor. Check database columns." });
    }
};

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
    createRequest, getTutors, sendTutorRequest, getTutorRequests, updateRequestStatus, getStudentRequests, registerTutor, loginUser
};

