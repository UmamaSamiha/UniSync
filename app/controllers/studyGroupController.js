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
};

module.exports = studyGroupController;