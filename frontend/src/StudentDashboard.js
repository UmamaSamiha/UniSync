import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentDashboard = ({ currentUser }) => {
    const [requests, setRequests] = useState([]);

    // Fetch requests specifically for the logged-in student
    const fetchMyRequests = () => {
        // We use the email from the currentUser prop to filter the database results
        axios.get(`http://localhost:5000/api/requests/student-dashboard/${currentUser.email}`)
            .then(res => setRequests(res.data))
            .catch(err => console.error("Error fetching student requests:", err));
    };

    useEffect(() => {
        if (currentUser && currentUser.email) {
            fetchMyRequests();
        }
    }, [currentUser]); // Re-runs if a different user logs in

    const containerStyle = {
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
    };

    const cardStyle = {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '15px',
        margin: '10px 0',
        backgroundColor: '#fdfdfd',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        maxWidth: '600px'
    };

    // Helper to color-code the status text
    const getStatusColor = (status) => {
        const s = status.toLowerCase();
        if (s === 'accepted') return '#28a745'; // Green
        if (s === 'rejected') return '#dc3545'; // Red
        return '#ffc107'; // Yellow/Orange for pending
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ color: '#333', borderBottom: '2px solid #007bff', display: 'inline-block' }}>
                My Requests (Student View)
            </h2>
            <div style={{ marginTop: '20px' }}>
                {requests.length > 0 ? (
                    requests.map(req => (
                        <div key={req.id} style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: '0' }}>Course: {req.courseCode || req.course_code}</h4>
                                <span style={{ 
                                    color: getStatusColor(req.status), 
                                    fontWeight: 'bold', 
                                    textTransform: 'uppercase',
                                    fontSize: '14px' 
                                }}>
                                    {req.status}
                                </span>
                            </div>
                            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                                <strong>Topic:</strong> {req.topic || 'N/A'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#999' }}>
                                Request ID: #{req.id}
                            </p>
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>
                        You haven't sent any tutoring requests yet.
                    </p>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;