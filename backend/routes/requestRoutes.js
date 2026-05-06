const express = require('express');
const router = express.Router();
const {
    getTutors,
    sendTutorRequest,   // <--- This is our primary fixed function
    getTutorRequests,
    updateRequestStatus,
    getStudentRequests,
    registerTutor,
    loginUser
} = require('../controllers/requestController');

// --- Routes ---

// 1. Send a Request (Changed from '/' and createRequest to match your frontend)
// This is the route triggered by axios.post('http://localhost:5000/api/requests', ...)
router.post('/', sendTutorRequest);

// 2. Get All Tutors
router.get('/tutors', getTutors);

// 3. Tutor Dashboard: Get requests for a specific tutor
router.get('/tutor-dashboard/:tutorId', getTutorRequests);

// 4. Update Status: Accept or Reject
router.put('/:id/status', updateRequestStatus);

// 5. Student Dashboard: Get requests made by a specific student
router.get('/student/:email', getStudentRequests);

module.exports = router;