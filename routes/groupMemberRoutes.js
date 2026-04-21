const express = require('express');
const router = express.Router({ mergeParams: true });
const groupMemberController = require('../app/controllers/groupMemberController');

router.get('/join', groupMemberController.showJoinForm);
router.post('/join', groupMemberController.join);

module.exports = router;