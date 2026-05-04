import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentDashboard = ({ currentUser }) => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        if (currentUser && currentUser.email) {
            // We encode the email to make sure special characters don't break the URL
            const userEmail = encodeURIComponent(currentUser.email);
            axios.get(`http://localhost:5000/api/requests/student/${userEmail}`)
                .then(res => {
                    setRequests(res.data);
                })
                .catch(err => {
                    console.error("Error fetching student requests:", err);
                });
        }
    }, [currentUser.email]); // Re-runs if the logged-in user changes

    const statusStyle = (status) => ({
        fontWeight: 'bold',
        color: status === 'accepted' ? '#28a745' : status === 'rejected' ? '#dc3545' : '#ffc107',
        textTransform: 'uppercase'
    });

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#333', borderBottom: '2px solid #007bff', display: 'inline-block' }}>
                My Requests (Student View)
            </h2>
            
            {requests.length > 0 ? (
                <div style={{ marginTop: '20px' }}>
                    {requests.map((req) => (
                        <div key={req.id} style={{ 
                            border: '1px solid #ddd', 
                            padding: '15px', 
                            borderRadius: '10px', 
                            marginBottom: '10px', 
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <p style={{ margin: '0 0 5px 0' }}><strong>📚 Course:</strong> {req.course_code}</p>
                            <p style={{ margin: '0 0 5px 0' }}><strong>💬 Topic:</strong> {req.topic || "N/A"}</p>
                            <p style={{ margin: '0' }}>
                                <strong>Status: </strong> 
                                <span style={statusStyle(req.status)}>{req.status}</span>
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ fontStyle: 'italic', color: '#666', marginTop: '20px' }}>
                    You haven't sent any tutoring requests yet.
                </p>
            )}
        </div>
    );
};

export default StudentDashboard;