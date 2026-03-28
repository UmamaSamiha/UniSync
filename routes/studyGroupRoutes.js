const express = require('express');
const router = express.Router();
const studyGroupController = require('../app/controllers/studyGroupController');

router.get('/', studyGroupController.index);
router.get('/create', studyGroupController.showCreateForm);
router.post('/', studyGroupController.create);

module.exports = router;