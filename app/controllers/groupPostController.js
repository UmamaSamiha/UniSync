const GroupPost = require('../models/GroupPost');
const GroupMember = require('../models/GroupMember');
const TaskUpdate = require('../models/TaskUpdate');
const StudyGroup = require('../models/StudyGroup');

const groupPostController = {
  // GET /study-groups/:id/posts/create
  showCreateForm: async (req, res) => {
    try {
      const group = await StudyGroup.getById(req.params.id);
      if (!group) return res.status(404).send('Group not found');
      const members = await GroupMember.getByGroup(req.params.id);
      res.render('groupPosts/create', { group, members, error: null });
    } catch (err) {
      res.status(500).send('Server error: ' + err.message);
    }
  },

  // POST /study-groups/:id/posts
  create: async (req, res) => {
    const { posted_by, type, title, content, assigned_to, due_date } = req.body;
    const groupId = req.params.id;

    if (!posted_by || !type || !title || !content) {
      const group = await StudyGroup.getById(groupId);
      const members = await GroupMember.getByGroup(groupId);
      return res.render('groupPosts/create', {
        group, members,
        error: 'All required fields must be filled in.',
      });
    }

    try {
      await GroupPost.create({
        group_id: groupId,
        posted_by,
        type,
        title,
        content,
        assigned_to: type === 'task' ? assigned_to : null,
        due_date: type === 'task' ? due_date : null,
      });
      res.redirect('/study-groups/' + groupId);
    } catch (err) {
      res.status(500).send('Server error: ' + err.message);
    }
  },

  // GET /study-groups/:id/posts/:postId — view single task
  show: async (req, res) => {
    try {
      const group = await StudyGroup.getById(req.params.id);
      const post = await GroupPost.getById(req.params.postId);
      if (!post) return res.status(404).send('Post not found');
      const updates = await TaskUpdate.getByPost(req.params.postId);
      const members = await GroupMember.getByGroup(req.params.id);
      res.render('groupPosts/show', { group, post, updates, members });
    } catch (err) {
      res.status(500).send('Server error: ' + err.message);
    }
  },

  // POST /study-groups/:id/posts/:postId/status — update task status
  updateStatus: async (req, res) => {
    const { updated_by, new_status, note } = req.body;
    const { id, postId } = req.params;

    try {
      const post = await GroupPost.getById(postId);
      await TaskUpdate.create({
        post_id: postId,
        updated_by,
        old_status: post.status,
        new_status,
        note,
      });
      await GroupPost.updateStatus(postId, new_status);
      res.redirect('/study-groups/' + id + '/posts/' + postId);
    } catch (err) {
      res.status(500).send('Server error: ' + err.message);
    }
  },
};

module.exports = groupPostController;