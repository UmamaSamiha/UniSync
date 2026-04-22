import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TutorList = ({ currentUser }) => {
    const [tutors, setTutors] = useState([]);

    // Fetch the list of available tutors from the backend
    useEffect(() => {
        axios.get('http://localhost:5000/api/requests/tutors')
            .then(res => setTutors(res.data))
            .catch(err => console.error("Error fetching tutors:", err));
    }, []);

    const handleRequest = async (tutorId, courseCode) => {
        const requestData = {
            student_name: currentUser.name,   // Dynamic name from Login
            student_email: currentUser.email, // Dynamic email from Login
            tutor_id: tutorId,
            course_code: courseCode,
            topic: "General Discussion"       // You can add an input for this later if you want!
        };

        try {
            const response = await axios.post('http://localhost:5000/api/requests', requestData);
            alert(response.data.message);
        } catch (err) {
            console.error(err);
            alert("❌ Error sending request. Check if the backend is running.");
        }
    };

    const containerStyle = {
        padding: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px'
    };

    const cardStyle = {
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '20px',
        width: '280px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        transition: 'transform 0.2s'
    };

    const buttonStyle = {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginTop: '10px'
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#333', borderBottom: '2px solid #28a745', display: 'inline-block' }}>
                Available Peer Tutors
            </h2>
            <div style={containerStyle}>
                {tutors.length > 0 ? (
                    tutors.map(tutor => (
                        <div key={tutor.id} style={cardStyle} className="tutor-card">
                            <h3 style={{ color: '#007bff', margin: '0 0 10px 0' }}>{tutor.name}</h3>
                            <p><strong>📚 Subject:</strong> {tutor.subject}</p>
                            <p><strong>⭐ Rating:</strong> {tutor.rating} / 5.0</p>
                            <p style={{ fontStyle: 'italic', color: '#666' }}>"{tutor.bio}"</p>
                            <button 
                                style={buttonStyle} 
                                onClick={() => handleRequest(tutor.id, tutor.subject)}
                            >
                                Request Session
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No tutors available at the moment.</p>
                )}
            </div>
        </div>
    );
};

export default TutorList;