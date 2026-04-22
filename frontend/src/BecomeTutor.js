import React, { useState } from 'react';
import axios from 'axios';

const BecomeTutor = () => {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        bio: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/requests/tutors/register', formData);
            alert(response.data.message);
            // Clear the form after success
            setFormData({ name: '', subject: '', bio: '' });
            // Optional: You could force a page reload here to instantly update the TutorList
            window.location.reload(); 
        } catch (error) {
            console.error("Error registering:", error);
            alert("Error registering as a tutor. Check the console.");
        }
    };

    const inputStyle = { width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc' };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '500px' }}>
            <h2 style={{ color: '#333', borderBottom: '2px solid #6f42c1', display: 'inline-block' }}>
                Become a Peer Tutor
            </h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '20px', backgroundColor: '#fdfdfd', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                <label><strong>Your Name:</strong></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} required placeholder="e.g. John Doe" />

                <label><strong>Subject You Want to Teach:</strong></label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} style={inputStyle} required placeholder="e.g. CSE470" />

                <label><strong>Short Bio / Tagline:</strong></label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px' }} required placeholder="e.g. I love helping students with database architecture!" />

                <button type="submit" style={{ backgroundColor: '#6f42c1', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', width: '100%', fontSize: '16px', marginTop: '10px' }}>
                    Register as Tutor
                </button>
            </form>
        </div>
    );
};

export default BecomeTutor;