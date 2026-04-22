import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TutorDashboard = () => {
    const [requests, setRequests] = useState([]);
    const tutorId = 1; // Hardcoded for testing (Anika's ID). Later, get this from user login.

    // Function to fetch the data
    const fetchRequests = () => {
        axios.get(`http://localhost:5000/api/requests/tutor-dashboard/${tutorId}`)
            .then(res => setRequests(res.data))
            .catch(err => console.error("Error fetching requests:", err));
    };

    // Run this when the page loads
    useEffect(() => {
        fetchRequests();
    }, []);

    // Function to handle Accept/Reject buttons
    const handleAction = async (id, status) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/requests/${id}/status`, { status });
            alert(response.data.message);
            fetchRequests(); // Refresh the list so the card disappears!
        } catch (err) {
            alert("Error updating request");
        }
    };

    const cardStyle = {
        border: '1px solid #ccc', borderRadius: '8px', padding: '15px', 
        margin: '10px 0', backgroundColor: '#fdfdfd', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        maxWidth: '500px'
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ color: '#333', borderBottom: '2px solid #ffc107', display: 'inline-block' }}>
                My Tutoring Dashboard
            </h2>
            <div style={{ marginTop: '20px' }}>
                {requests.length > 0 ? (
                    requests.map(req => (
                        <div key={req.id} style={cardStyle}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Request from: {req.student_name}</h4>
                            <p><strong>Course:</strong> {req.course_code}</p>
                            <p><strong>Email:</strong> {req.student_email}</p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button 
                                    onClick={() => handleAction(req.id, 'accepted')}
                                    style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                                    ✅ Accept
                                </button>
                                <button 
                                    onClick={() => handleAction(req.id, 'rejected')}
                                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No pending requests right now.</p>
                )}
            </div>
        </div>
    );
};

export default TutorDashboard;