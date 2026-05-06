import React, { useState } from 'react';
import Login from './Login';
import StudentDashboard from './StudentDashboard';
import TutorDashboard from './TutorDashboard';
import TutorList from './TutorList';
import StudyTasks from './StudyTasks';
import './App.css';

const SIDEBAR_W = 240;

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [section, setSection]         = useState('tutoring');

    const handleLogin  = (user) => { setCurrentUser(user); };
    const handleLogout = ()     => { setCurrentUser(null); setSection('tutoring'); };

    if (!currentUser) return <Login onLogin={handleLogin} />;

    const initials = currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const navItems = [
        { key: 'tutoring',   icon: '🎓', label: 'Peer Tutoring' },
        { key: 'studytasks', icon: '📚', label: 'Task Tracker'  },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: 'linear-gradient(135deg, #e0fafa 0%, #f4fcfb 100%)' }}>

            {/* ── SIDEBAR ── */}
            <div style={{ width: SIDEBAR_W, flexShrink: 0, height: '100vh', position: 'fixed', left: 0, top: 0, background: '#fff', borderRight: '1px solid #d0f7ef', display: 'flex', flexDirection: 'column', zIndex: 50, boxShadow: '2px 0 16px rgba(22,74,70,0.06)' }}>

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '24px 20px 20px', borderBottom: '1px solid #d0f7ef' }}>
                    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="12" stroke="#22ab99" strokeWidth="2"/>
                        <path d="M9 14.5L12.5 18L19 11" stroke="#22ab99" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontWeight: 700, fontSize: '1.2rem', background: 'linear-gradient(135deg, #178a7e, #3f8fe3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UniSync</span>
                </div>

                {/* Nav items */}
                <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a5b0', textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 8px 8px' }}>Menu</div>
                    {navItems.map(item => {
                        const active = section === item.key;
                        return (
                            <button key={item.key} onClick={() => setSection(item.key)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, textAlign: 'left', width: '100%', transition: 'all 0.2s', background: active ? 'linear-gradient(135deg, #22ab99, #3f8fe3)' : 'transparent', color: active ? '#fff' : '#5e6f78', boxShadow: active ? '0 3px 10px rgba(34,171,153,0.3)' : 'none' }}>
                                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* User card + logout */}
                <div style={{ padding: '16px', borderTop: '1px solid #d0f7ef' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: '#effcf9', border: '1px solid #d0f7ef', marginBottom: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #3fc9b4, #64adeb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>{initials}</div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3a464d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#20c997', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{currentUser.role}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%', padding: '9px', borderRadius: '10px', border: '1.5px solid #dde4e8', background: 'transparent', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#5e6f78', transition: 'all 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseOut={e  => { e.currentTarget.style.borderColor = '#dde4e8'; e.currentTarget.style.color = '#5e6f78';  e.currentTarget.style.background = 'transparent'; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6"/>
                        </svg>
                        Log Out
                    </button>
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div style={{ marginLeft: SIDEBAR_W, flex: 1, minHeight: '100vh', overflowY: 'auto' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 28px 80px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Welcome */}
                    <div>
                        <h1 style={{ color: '#00838f', fontSize: '28px', margin: '0 0 4px 0' }}>Welcome, {currentUser.name}! 👋</h1>
                        <p style={{ color: '#6c757d', margin: 0, fontSize: '15px' }}>Ready for your study sessions?</p>
                    </div>

                    {section === 'tutoring' && (
                        <>
                            {currentUser.role === 'student' ? <StudentDashboard currentUser={currentUser} /> : <TutorDashboard currentUser={currentUser} />}
                            <TutorList currentUser={currentUser} />
                        </>
                    )}

                    {section === 'studytasks' && (
                        <StudyTasks currentUser={currentUser} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
