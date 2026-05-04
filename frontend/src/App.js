import React, { useState } from 'react';
import TutorList from './TutorList';
import TutorDashboard from './TutorDashboard';
import StudentDashboard from './StudentDashboard';
import BecomeTutor from './BecomeTutor';


function App() {

    const [user, setUser] = useState({ 
    id: 1, 
    email: 'student@test.com', 
    role: 'student' 
});


    // 2. The Main App: Only accessible after login
    return (
        <div className="App" style={{ padding: '20px', fontFamily: 'Arial' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc' }}>
                <h1>Welcome, {user.name}</h1>
                <button onClick={() => setUser(null)} style={{ margin: '20px', height: '30px' }}>Logout</button>
            </header>

            <main>
                <BecomeTutor currentUser={user} />
                <hr />
                <TutorList currentUser={user} />
                <hr />
                <StudentDashboard currentUser={user} />
                <hr />
                <TutorDashboard currentUser={user} />
            </main>
        </div>
    );
}

export default App;