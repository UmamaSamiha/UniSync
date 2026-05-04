import React, { useState } from 'react';
import Login from './Login';
import StudentDashboard from './StudentDashboard';
import TutorDashboard from './TutorDashboard';
import TutorList from './TutorList';
import './App.css'; // Keep this if you have global CSS

function App() {
    const [currentUser, setCurrentUser] = useState(null);

    const handleLogin = (user) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    // If no one is logged in, show the Login screen
    if (!currentUser) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0fafa 0%, #f4fcfb 100%)', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", paddingBottom: '60px' }}>
            
            {/* --- 🚀 THE SLEEK, MODERN NAVBAR --- */}
            <div style={{ backgroundColor: '#fff', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0, 168, 150, 0.05)', marginBottom: '40px' }}>
                <h2 style={{ color: '#00838f', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="12" stroke="#00838f" strokeWidth="2"/>
                        <path d="M9 14.5L12.5 18L19 11" stroke="#00838f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    UniSync
                </h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#333', fontSize: '16px' }}>{currentUser.name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#20c997', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>{currentUser.role}</p>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        style={{ backgroundColor: '#fff', color: '#dc3545', border: '1px solid #dc3545', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
                        onMouseOver={(e) => {e.target.style.backgroundColor = '#dc3545'; e.target.style.color = '#fff';}}
                        onMouseOut={(e) => {e.target.style.backgroundColor = '#fff'; e.target.style.color = '#dc3545';}}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* --- 📦 THE MAIN CONTENT AREA --- */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 🌟 THE RESTORED WELCOME MESSAGE 🌟 */}
                <div style={{ paddingBottom: '10px' }}>
                    <h1 style={{ color: '#00838f', fontSize: '32px', margin: '0 0 5px 0' }}>Welcome, {currentUser.name}! 👋</h1>
                    <p style={{ color: '#6c757d', margin: 0, fontSize: '16px' }}>Ready for your study sessions?</p>
                </div>

                {/* 🚨 STRICT ORDER: Dashboard (Requests) FIRST, then TutorList BELOW */}
                {currentUser.role === 'student' ? (
                    <>
                        <StudentDashboard currentUser={currentUser} />
                        <TutorList currentUser={currentUser} />
                    </>
                ) : (
                    <>
                        <TutorDashboard currentUser={currentUser} />
                        <TutorList currentUser={currentUser} />
                    </>
                )}
                
            </div>
        </div> 
    );
}

export default App;