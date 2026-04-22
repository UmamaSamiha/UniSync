import React, { useState } from 'react';
import axios from 'axios';
import TutorList from './TutorList';
import TutorDashboard from './TutorDashboard';
import StudentDashboard from './StudentDashboard';

function App() {
  const [formData, setFormData] = useState({
    studentName: '',
    courseCode: '',
    topic: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // This sends the data to your Backend running on port 5000
      const response = await axios.post('http://localhost:5000/api/requests', formData);
      alert("✅ Request Sent Successfully!");
      console.log(response.data);
      // Clear form
      setFormData({ studentName: '', courseCode: '', topic: '' });
    } catch (err) {
      console.error(err);
      alert("❌ Error sending request. Is the backend running?");
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Peer Tutoring Request</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        <input 
          type="text" placeholder="Your Name" required 
          value={formData.studentName}
          onChange={(e) => setFormData({...formData, studentName: e.target.value})}
          style={{ padding: '10px' }}
        />
        <input 
          type="text" placeholder="Course Code (e.g. CSE470)" required 
          value={formData.courseCode}
          onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
          style={{ padding: '10px' }}
        />
        <textarea 
          placeholder="What topic do you need help with?" required 
          value={formData.topic}
          onChange={(e) => setFormData({...formData, topic: e.target.value})}
          style={{ padding: '10px', minHeight: '100px' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Submit Request
        </button>
      </form>
      <hr />
      <TutorList />
      <TutorDashboard />
      <StudentDashboard />
    </div>
  );
}

export default App;