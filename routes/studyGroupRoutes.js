const express = require('express');
const router = express.Router();
const studyGroupController = require('../app/controllers/studyGroupController');
const groupMemberRoutes = require('./groupMemberRoutes');
const groupPostRoutes = require('./groupPostRoutes');

router.get('/', studyGroupController.index);
router.get('/create', studyGroupController.showCreateForm);
router.post('/', studyGroupController.create);
router.get('/:id', studyGroupController.show);

// Nested routes
router.use('/:id', groupMemberRoutes);
router.use('/:id', groupPostRoutes);

module.exports = router;