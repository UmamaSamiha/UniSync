import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TutorDashboard = ({ currentUser }) => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        // EXACT SAME LOGIC
        if (!currentUser) return;
        const expectedTutorId = (currentUser.email === 'umamasamiha@gmail.com') ? 11 : currentUser.id;

        axios.get(`http://localhost:5000/api/requests/tutor-dashboard/${expectedTutorId}`)
            .then(res => setRequests(res.data))
            .catch(err => console.error("Error fetching requests:", err));
    }, [currentUser]);

    const handleUpdateStatus = async (requestId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/requests/${requestId}/status`, { status: newStatus });
            setRequests(requests.filter(req => req.id !== requestId)); 
            alert(`Request successfully ${newStatus}!`);
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status.");
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0fafa 0%, #f4fcfb 100%)', padding: '40px 20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
               
                
                {requests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #b2dfdb' }}>
                        <p style={{ fontStyle: 'italic', margin: 0 }}>You are all caught up! No pending requests right now.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {requests.map(req => (
                            <div key={req.id} style={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #e0f2f1', 
                                padding: '24px', 
                                borderRadius: '16px', 
                                width: '320px', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}><strong>👤 {req.student_name}</strong></p>
                                    <p style={{ margin: '0 0 8px 0', color: '#6c757d' }}><strong>Course:</strong> <span style={{ color: '#00838f', fontWeight: '500' }}>{req.course_code}</span></p>
                                    <p style={{ margin: '0 0 20px 0', color: '#6c757d' }}>
                                        <strong>Status:</strong> 
                                        <span style={{ color: '#f6c23e', fontWeight: 'bold', marginLeft: '8px', backgroundColor: '#fdf3d8', padding: '4px 8px', borderRadius: '8px', fontSize: '12px' }}>
                                            PENDING ⏳
                                        </span>
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => handleUpdateStatus(req.id, 'accepted')}
                                        style={{ flex: 1, background: 'linear-gradient(90deg, #20c997 0%, #007bff 100%)', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'opacity 0.2s' }}
                                        onMouseOver={(e) => e.target.style.opacity = 0.9}
                                        onMouseOut={(e) => e.target.style.opacity = 1}
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                        style={{ flex: 1, backgroundColor: '#fff', color: '#dc3545', border: '1px solid #dc3545', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}
                                        onMouseOver={(e) => {e.target.style.backgroundColor = '#dc3545'; e.target.style.color = '#fff';}}
                                        onMouseOut={(e) => {e.target.style.backgroundColor = '#fff'; e.target.style.color = '#dc3545';}}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TutorDashboard;