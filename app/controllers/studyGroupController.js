const StudyGroup = require('../models/StudyGroup');

const studyGroupController = {
    // GET /study-groups — list all groups

    index: async (req, res) => {
        try {
            const groups = await StudyGroup.getAll();
            res.render('studyGroups/index', { groups });
        } catch (err) {
            console.error('INDEX ERROR:', err.message);
            res.status(500).send('Server error: ' + err.message);
        }
    },

    // GET /study-groups/create — show create form
    showCreateForm: (req, res) => {
        res.render('studyGroups/create', { error: null });
    },

    // POST /study-groups — handle form submission
    create: async (req, res) => {
        const { name, subject, description, created_by } = req.body;

        // Basic validation
        if (!name || !subject || !created_by) {
            return res.render('studyGroups/create', {
                error: 'Name, subject, and your name are required.',
            });
        }

        try {
            await StudyGroup.create({ name, subject, description, created_by });
            res.redirect('/study-groups');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    },
    // GET /study-groups/:id — show single group with members and posts
    show: async (req, res) => {
        try {
            const group = await StudyGroup.getById(req.params.id);
            if (!group) return res.status(404).send('Group not found');

            const GroupMember = require('../models/GroupMember');
            const GroupPost = require('../models/GroupPost');

            const members = await GroupMember.getByGroup(req.params.id);
            const posts = await GroupPost.getByGroup(req.params.id);

            res.render('studyGroups/show', { group, members, posts });
        } catch (err) {
            console.error('SHOW ERROR:', err.message);
            res.status(500).send('Server error: ' + err.message);
        }
    },
};

module.exports = studyGroupController;