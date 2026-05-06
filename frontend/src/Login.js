import React, { useState } from 'react';
import axios from 'axios'; // Required for backend communication
import './Login.css';

function Login({ onLogin }) {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('student');
    const [alert, setAlert] = useState({ message: '', type: '' });

    // --- HYBRID LOGIN LOGIC ---
    const handleLogin = async (e) => {
        e.preventDefault();
        
        // 1. Instant Login for Miftaul Jannat (Student)
        if (email === 'miftauljannat@gmail.com' && password === '12345') {
            onLogin({ id: 10, name: 'Miftaul Jannat', email: email, role: 'student' });
            return;
        } 
        
        // 2. Instant Login for Umama Samiha (Tutor)
        if (email === 'umamasamiha@gmail.com' && password === '12345678') {
            onLogin({ id: 11, name: 'Umama Samiha', email: email, role: 'tutor' });
            return;
        }

        // 3. Dynamic Login for everyone else in the Database (Anika, etc.)
        try {
            const response = await axios.post('http://localhost:5000/api/login', { email, password });
            if (response.data && response.data.user) {
                onLogin(response.data.user); 
            } else {
                setAlert({ message: 'Invalid credentials.', type: 'error' });
            }
        } catch (err) {
            setAlert({ message: 'User not found. Please Sign Up!', type: 'error' });
        }
    };

    // --- SIGNUP LOGIC ---
    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const newUser = { name, email, password, role };
            await axios.post('http://localhost:5000/api/signup', newUser);
            setAlert({ message: 'Account created successfully! You can now log in.', type: 'success' });
            setActiveTab('login'); // Switch back to login tab after success
        } catch (err) {
            const msg = err.response?.data?.error || 'Signup failed. Please try again.';
            setAlert({ message: msg, type: 'error' });
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="bg-shape bg-1"></div>
            <div className="bg-shape bg-2"></div>

            <div className="login-card">
                <div className="logo">
                    <div className="logo-icon">
                        <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2"/>
                            <path d="M9 14.5L12.5 18L19 11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h1>UniSync</h1>
                </div>
                <p className="tagline">Study Task Manager · Showcase Demo</p>

                <div className="tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} 
                        onClick={() => { setActiveTab('login'); setAlert({message: '', type: ''}); }}
                    >
                        Log In
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`} 
                        onClick={() => { setActiveTab('signup'); setAlert({message: '', type: ''}); }}
                    >
                        Sign Up
                    </button>
                </div>

                {alert.message && (
                    <div className={`alert ${alert.type}`}>{alert.message}</div>
                )}

                {activeTab === 'login' ? (
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input 
                                className="form-input" 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input 
                                className="form-input" 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn-submit">Log In</button>
                        
                        <div className="hint">
                            <strong>Showcase Accounts:</strong><br/>
                            Student: miftauljannat@gmail.com (12345)<br/>
                            Tutor: umamasamiha@gmail.com (12345678)
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSignup}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input 
                                className="form-input" 
                                type="email" 
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                className="form-input"
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">I am a...</label>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                {['student', 'tutor'].map(r => (
                                    <div
                                        key={r}
                                        onClick={() => setRole(r)}
                                        style={{
                                            flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                                            border: `2px solid ${role === r ? '#00838f' : '#d0f7ef'}`,
                                            background: role === r ? '#effcf9' : '#fff',
                                            textAlign: 'center', fontWeight: 600,
                                            color: role === r ? '#00838f' : '#888',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {r === 'student' ? '🎓 Student' : '📖 Tutor'}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button type="submit" className="btn-submit">Create Account</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Login;