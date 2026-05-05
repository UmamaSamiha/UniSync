const express = require('express');
const router = express.Router({ mergeParams: true });
const groupPostController = require('../app/controllers/groupPostController');

router.get('/posts/create', groupPostController.showCreateForm);
router.post('/posts', groupPostController.create);
router.get('/posts/:postId', groupPostController.show);
router.post('/posts/:postId/status', groupPostController.updateStatus);

module.exports = router;