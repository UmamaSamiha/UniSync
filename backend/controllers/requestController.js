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

module.exports = {
    createRequest
};