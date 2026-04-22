const express = require('express');
const router = express.Router();
const { createRequest, getTutors } = require('../controllers/requestController');
router.post('/', createRequest);
module.exports = router;
router.get('/tutors', getTutors);