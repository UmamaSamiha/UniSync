import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TutorList = ({ currentUser }) => {
    const [tutors, setTutors] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); 

    useEffect(() => {
        axios.get('http://localhost:5000/api/requests/tutors')
            .then(res => setTutors(res.data))
            .catch(err => console.error("Error fetching tutors:", err));
    }, []);

    const handleRequest = async (tutorId, courseCode, tutorName) => {
        // EXACT SAME LOGIC
        if (!currentUser) return alert("Please log in first!");
        const finalTutorId = (tutorName === 'Umama Samiha') ? 11 : tutorId;

        const requestData = {
            student_name: currentUser.name,   
            student_email: currentUser.email, 
            tutor_id: finalTutorId, 
            course_code: courseCode,
            topic: "General Discussion",
            status: "pending"
        };

        try {
            await axios.post('http://localhost:5000/api/requests', requestData);
            alert(`✅ Request sent successfully to ${tutorName}!`);
            setSearchTerm(""); 
        } catch (err) {
            console.error(err);
            alert("❌ Error sending request.");
        }
    };

    const filteredTutors = tutors.filter(tutor => {
        const isNotMe = currentUser && tutor.id !== currentUser.id;
        const matchesSearch = tutor.subject.toLowerCase().includes(searchTerm.toLowerCase());
        return isNotMe && matchesSearch;
    });

    return (
        <div style={{ padding: '40px 20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h2 style={{ color: '#00838f', marginBottom: '20px' }}>
                    Available Peer Tutors
                </h2>

                <div style={{ marginBottom: '40px' }}>
                    <input 
                        type="text" 
                        placeholder="🔍 Search course (e.g. CSE470)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            padding: '14px 20px', 
                            width: '100%', 
                            maxWidth: '500px',
                            borderRadius: '12px', 
                            border: '1px solid #b2dfdb', 
                            fontSize: '16px',
                            outline: 'none',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {searchTerm.trim() === "" ? (
                        <p style={{ color: '#888', fontStyle: 'italic' }}>Please enter a course code to see available tutors.</p>
                    ) : filteredTutors.length > 0 ? (
                        filteredTutors.map(tutor => (
                            <div key={tutor.id} style={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #e0f2f1', 
                                borderRadius: '16px', 
                                padding: '24px', 
                                width: '300px', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <h3 style={{ color: '#00838f', margin: '0 0 10px 0' }}>{tutor.name}</h3>
                                    <p style={{ margin: '0 0 8px 0', color: '#495057' }}><strong>📚 Subject:</strong> <span style={{ backgroundColor: '#e0fafa', padding: '4px 8px', borderRadius: '6px', color: '#00838f', fontWeight: '500', fontSize: '14px' }}>{tutor.subject}</span></p>
                                    <p style={{ margin: '0 0 12px 0', color: '#495057' }}><strong>⭐ Rating:</strong> {tutor.rating} / 5.0</p>
                                    <p style={{ fontStyle: 'italic', color: '#6c757d', fontSize: '14px', margin: '0 0 20px 0', lineHeight: '1.4' }}>"{tutor.bio}"</p>
                                </div>
                                
                                <button 
                                    style={{ background: 'linear-gradient(90deg, #20c997 0%, #007bff 100%)', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'opacity 0.2s' }} 
                                    onMouseOver={(e) => e.target.style.opacity = 0.9}
                                    onMouseOut={(e) => e.target.style.opacity = 1}
                                    onClick={() => handleRequest(tutor.id, tutor.subject, tutor.name)}
                                >
                                    Request Session
                                </button>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#dc3545' }}>No tutors found for "{searchTerm}".</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TutorList;