import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TutorList = () => {
    const [tutors, setTutors] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/requests/tutors')
            .then(res => setTutors(res.data))
            .catch(err => console.error("Frontend Fetch Error:", err));
    }, []);

    const cardStyle = {
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '20px',
        margin: '15px 0',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        maxWidth: '500px'
    };

const handleRequest = async (tutorId, courseCode) => {
    // For now, we use dummy student data. Later this will come from your Login/Session.
    const requestData = {
        student_name: "Test Student", 
        student_email: "student@test.com",
        tutor_id: tutorId,
        course_code: courseCode
    };

    try {
        const response = await axios.post('http://localhost:5000/api/requests/send-request', requestData);
        alert(response.data.message);
    } catch (err) {
        alert("Error sending request");
    }
};
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ color: '#333', borderBottom: '2px solid #007bff', display: 'inline-block' }}>
                Available Peer Tutors
            </h2>
            <div style={{ marginTop: '20px' }}>
                {tutors.length > 0 ? (
                    tutors.map(tutor => (
                        <div key={tutor.id} style={cardStyle}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{tutor.name}</h3>
                            <p><strong>📚 Subject:</strong> {tutor.subject}</p>
                            <p><strong>⭐ Rating:</strong> {tutor.rating} / 5.0</p>
                            <p style={{ color: '#666', fontStyle: 'italic' }}>"{tutor.bio}"</p>
                            <button 
    onClick={() => handleRequest(tutor.id, tutor.subject)}
    style={{ 
        backgroundColor: '#28a745', 
        color: 'white', 
        border: 'none', 
        padding: '8px 15px', 
        borderRadius: '5px', 
        cursor: 'pointer' 
    }}
>
    Request Session
</button>
                        </div>
                    ))
                ) : (
                    <p>Loading tutors...</p>
                )}
            </div>
        </div>
    );
};

export default TutorList;