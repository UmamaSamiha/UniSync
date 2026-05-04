import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentDashboard = ({ currentUser }) => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        // EXACT SAME LOGIC
        if (!currentUser || !currentUser.email) return;

        axios.get(`http://localhost:5000/api/requests/student/${currentUser.email}`)
            .then(res => setRequests(res.data))
            .catch(err => console.error("Error fetching student requests:", err));
    }, [currentUser]); 

    const statusStyle = (status) => ({
        fontWeight: 'bold',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        color: '#fff',
        backgroundColor: status === 'accepted' ? '#20c997' : status === 'rejected' ? '#dc3545' : '#f6c23e',
        textTransform: 'uppercase',
        display: 'inline-block',
        marginTop: '5px'
    });

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0fafa 0%, #f4fcfb 100%)', padding: '40px 20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 24px rgba(0, 168, 150, 0.05)', border: '1px solid #e0f2f1' }}>
                <h2 style={{ color: '#00838f', borderBottom: '2px solid #e0f2f1', paddingBottom: '10px', marginBottom: '20px' }}>
                    <span style={{ marginRight: '10px' }}>🎓</span> My Requests
                </h2>
                
                {requests.length > 0 ? (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {requests.map((req) => (
                            <div key={req.id} style={{ 
                                border: '1px solid #e0f2f1', 
                                padding: '20px', 
                                borderRadius: '12px', 
                                backgroundColor: '#fafdfc',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}>
                                <p style={{ margin: '0 0 8px 0', color: '#495057', fontSize: '16px' }}><strong>📚 Course:</strong> {req.course_code}</p>
                                <p style={{ margin: '0 0 12px 0', color: '#6c757d', fontSize: '14px' }}><strong>💬 Topic:</strong> {req.topic || "General Discussion"}</p>
                                <div>
                                    <span style={statusStyle(req.status)}>{req.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888', backgroundColor: '#f8fdfc', borderRadius: '12px', border: '1px dashed #b2dfdb' }}>
                        <p style={{ fontStyle: 'italic', margin: 0 }}>You haven't sent any tutoring requests yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;