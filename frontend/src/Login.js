import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/requests/login', { email, password });
            alert(`Welcome back, ${res.data.user.name}!`);
            onLoginSuccess(res.data.user); // Save user to App state
        } catch (err) {
            alert("Login failed. Check your credentials.");
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '300px', margin: '20px auto' }}>
            <h3>Login</h3>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '90%', marginBottom: '10px', padding: '8px' }} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '90%', marginBottom: '10px', padding: '8px' }} required />
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Sign In</button>
            </form>
        </div>
    );
};

export default Login;