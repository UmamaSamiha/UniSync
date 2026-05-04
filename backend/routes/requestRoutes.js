const express = require('express');
const router = express.Router();

const {
    getTutors, 
    sendTutorRequest, 
    getAllRequests, 
    getTutorRequests, 
    updateRequestStatus, 
    getStudentRequests, // 🚨 ADDED THIS BACK IN!
    registerTutor, 
    loginUser
} = require('../controllers/requestController'); 

// --- AUTHENTICATION ---
router.post('/login', loginUser);
router.post('/signup', registerTutor); 

// --- GENERAL REQUESTS ---
router.get('/requests', getAllRequests);       
router.post('/requests', sendTutorRequest);    
router.put('/requests/:id', updateRequestStatus); 

// --- TUTOR ROUTES ---
router.get('/requests/tutors', getTutors);
router.get('/requests/tutor/:tutorId', getTutorRequests);

// --- 🚨 THE NEW STUDENT TUNNEL 🚨 ---
// Matches what your Student View needs to fetch requests by email
router.get('/requests/student/:email', getStudentRequests);

module.exports = router;