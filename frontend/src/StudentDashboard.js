import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentDashboard = () => {
    const [requests, setRequests] = useState([]);
    
    // Hardcoded for testing. This matches the email we saved in the database earlier!
    const studentEmail = "student@test.com";

    const fetchMyRequests = () => {
        axios.get(`http://localhost:5000/api/requests/student-dashboard/${studentEmail}`)
            .then(res => setRequests(res.data))
            .catch(err => console.error("Error fetching requests:", err));
    };

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const cardStyle = {
        border: '1px solid #ccc', borderRadius: '8px', padding: '15px', 
        margin: '10px 0', backgroundColor: '#fdfdfd', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        maxWidth: '500px'
    };

    // Helper function to color-code the status!
    const getStatusColor = (status) => {
        if (status === 'accepted') return '#28a745'; // Green
        if (status === 'rejected') return '#dc3545'; // Red
        return '#ffc107'; // Yellow/Orange for pending
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ color: '#333', borderBottom: '2px solid #007bff', display: 'inline-block' }}>
                My Requests (Student View)
            </h2>
            <div style={{ marginTop: '20px' }}>
                {requests.length > 0 ? (
                    requests.map(req => (
                        <div key={req.id} style={cardStyle}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Course: {req.course_code}</h4>
                            <p><strong>Sent to Tutor ID:</strong> {req.tutor_id}</p>
                            <p style={{ margin: '10px 0 0 0', fontSize: '18px' }}>
                                <strong>Status: </strong> 
                                <span style={{ color: getStatusColor(req.status), fontWeight: 'bold', textTransform: 'capitalize' }}>
                                    {req.status}
                                </span>
                            </p>
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>You haven't sent any requests yet.</p>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;