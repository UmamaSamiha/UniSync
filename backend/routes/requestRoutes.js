const express = require('express');
const router = express.Router();
const { createRequest, getTutors, sendTutorRequest } = require('../controllers/requestController');
router.post('/', createRequest);
module.exports = router;
router.get('/tutors', getTutors);
router.post('/send-request', sendTutorRequest);