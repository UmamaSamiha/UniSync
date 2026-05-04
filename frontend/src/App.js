import React, { useState } from 'react';
import TutorList from './TutorList';
import TutorDashboard from './TutorDashboard';
import StudentDashboard from './StudentDashboard';

function App() {
    // Logged in as Janifa (Student)
    const [user, setUser] = useState({ 
        id: 10, 
        name: 'Janifa', 
        email: 'student@test.com', 
        role: 'student' 
    });

    return (
        <div className="App" style={{ padding: '20px', fontFamily: 'Arial' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
                <div>
                    <h1>Welcome, {user.name}</h1>
                    <p style={{ color: '#666', marginTop: '-10px' }}>
                        Logged in as: <strong>{user.role.toUpperCase()}</strong>
                    </p>
                </div>
                <button onClick={() => setUser(null)} style={{ margin: '20px', height: '30px' }}>Logout</button>
            </header>

            <main>
                {/* Janifa will see the search bar; the list will be hidden until she types */}
                <TutorList currentUser={user} />
                
                <hr style={{ margin: '40px 0' }}/>
                
                {/* Janifa's history (MAT215, CSE470, etc.) */}
                <StudentDashboard currentUser={user} />

                {/* This section will remain hidden for Janifa */}
                {user.role === 'tutor' && (
                    <>
                        <hr style={{ margin: '40px 0' }}/>
                        <TutorDashboard currentUser={user} />
                    </>
                )}
            </main>
        </div>
    );
}

export default App;