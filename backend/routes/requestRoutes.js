const express = require('express');
const router = express.Router();
const { 
    createRequest, 
    getTutors, 
    sendTutorRequest, 
    getTutorRequests, 
    updateRequestStatus,
    getStudentRequests
} = require('../controllers/requestController');

// Existing Routes
router.post('/', createRequest);
router.get('/tutors', getTutors);
router.post('/send-request', sendTutorRequest);

// New Dashboard Routes
router.get('/tutor-dashboard/:tutorId', getTutorRequests);
router.put('/:id/status', updateRequestStatus);

router.get('/student-dashboard/:email', getStudentRequests);
// THIS MUST BE THE ABSOLUTE LAST LINE
module.exports = router;