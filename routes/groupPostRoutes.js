const express = require('express');
const router = express.Router({ mergeParams: true });
const groupPostController = require('../app/controllers/groupPostController');

router.get('/posts/create', groupPostController.showCreateForm);
router.post('/posts', groupPostController.create);

module.exports = router;