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

    const handleRequest = async (tutorId, courseCode) => {
        const requestData = {
            student_name: currentUser.name,   
            student_email: currentUser.email, 
            tutor_id: tutorId,
            course_code: courseCode,
            topic: "General Discussion"       
        };

        try {
            const response = await axios.post('http://localhost:5000/api/requests', requestData);
            alert(response.data.message);
            window.location.reload(); 
        } catch (err) {
            console.error(err);
            alert("❌ Error sending request.");
        }
    };

    const filteredTutors = tutors.filter(tutor => {
        const isNotMe = tutor.id !== currentUser.id;
        const matchesSearch = tutor.subject.toLowerCase().includes(searchTerm.toLowerCase());
        return isNotMe && matchesSearch;
    });

    // --- STYLES ---
    const searchContainerStyle = { marginBottom: '30px', textAlign: 'left' };
    const searchInputStyle = {
        padding: '12px 15px',
        width: '100%',
        maxWidth: '400px',
        borderRadius: '8px',
        border: '2px solid #28a745',
        fontSize: '16px',
        outline: 'none'
    };
    const containerStyle = { display: 'flex', flexWrap: 'wrap', gap: '20px' };
    const cardStyle = {
        border: '1px solid #ddd', borderRadius: '12px', padding: '20px',
        width: '280px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#fff'
    };
    const buttonStyle = {
        backgroundColor: '#28a745', color: 'white', border: 'none',
        padding: '10px 15px', borderRadius: '6px', cursor: 'pointer',
        fontWeight: 'bold', marginTop: '10px'
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#333', borderBottom: '2px solid #28a745', display: 'inline-block', marginBottom: '20px' }}>
                Available Peer Tutors
            </h2>

            <div style={searchContainerStyle}>
                <input 
                    type="text" 
                    placeholder="🔍 Type a course code to find tutors (e.g. CSE470)..." 
                    style={searchInputStyle}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div style={containerStyle}>
                {searchTerm.trim() === "" ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>
                        Please enter a course code above to see available tutors.
                    </p>
                ) : filteredTutors.length > 0 ? (
                    filteredTutors.map(tutor => (
                        <div key={tutor.id} style={cardStyle}>
                            <h3 style={{ color: '#007bff', margin: '0 0 10px 0' }}>{tutor.name}</h3>
                            <p style={{ marginBottom: '5px' }}><strong>📚 Subject:</strong> {tutor.subject}</p>
                            
                            {/* --- THE RATING IS BACK --- */}
                            <p style={{ marginBottom: '10px', color: '#555' }}>
                                <strong>⭐ Rating:</strong> {tutor.rating} / 5.0
                            </p>
                            
                            <p style={{ fontStyle: 'italic', color: '#666', fontSize: '14px', lineHeight: '1.4' }}>
                                "{tutor.bio}"
                            </p>
                            <button 
                                style={buttonStyle} 
                                onClick={() => handleRequest(tutor.id, tutor.subject)}
                            >
                                Request Session
                            </button>
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#666' }}>No tutors found matching "{searchTerm}".</p>
                )}
            </div>
        </div>
    );
};

export default TutorList;