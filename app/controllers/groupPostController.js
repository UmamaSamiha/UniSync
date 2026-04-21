const GroupPost = require('../models/GroupPost');
const StudyGroup = require('../models/StudyGroup');

const groupPostController = {
// GET /study-groups/:id/posts/create — show post form
    showCreateForm: async (req, res) => {
        try {
            const group = await StudyGroup.getById(req.params.id);
            if (!group) return res.status(404).send('Group not found');
            res.render('groupPosts/create', { group, error: null });
        } catch (err) {
            console.error('POST FORM ERROR:', err.message);
            res.status(500).send('Server error: ' + err.message);
        }
    },

// POST /study-groups/:id/posts — handle post creation
    create: async (req, res) => {
        const { posted_by, type, title, content } = req.body;
        const groupId = req.params.id;

        if (!posted_by || !type || !title || !content) {
            const group = await StudyGroup.getById(groupId);
            return res.render('groupPosts/create', {
                group,
                error: 'All fields are required.',
            });
        }

        try {
            await GroupPost.create({
                group_id: groupId,
                posted_by,
                type,
                title,
                content,
            });
            res.redirect('/study-groups/' + groupId);
        } catch (err) {
            console.error('POST CREATE ERROR:', err.message);
            res.status(500).send('Server error: ' + err.message);
        }
    },
};

module.exports = groupPostController;