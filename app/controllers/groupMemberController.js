const GroupMember = require('../models/GroupMember');
const StudyGroup = require('../models/StudyGroup');

const groupMemberController = {
  showJoinForm: async (req, res) => {
    try {
      const group = await StudyGroup.getById(req.params.id);
      if (!group) return res.status(404).send('Group not found');
      res.render('studyGroups/join', { group, error: null });
    } catch (err) {
      console.error('JOIN FORM ERROR:', err.message);
      res.status(500).send('Server error: ' + err.message);
    }
  },

  join: async (req, res) => {
    const { student_name, student_id, email, contact, major, semester, subject_interest } = req.body;
    const groupId = req.params.id;

    // Validation
    if (!student_name || !student_id || !email || !contact || !major || !semester || !subject_interest) {
      const group = await StudyGroup.getById(groupId);
      return res.render('studyGroups/join', {
        group,
        error: 'All required fields must be filled in.',
      });
    }

    if (student_id.length !== 8) {
      const group = await StudyGroup.getById(groupId);
      return res.render('studyGroups/join', {
        group,
        error: 'Student ID must be exactly 8 digits.',
      });
    }

    if (contact.length !== 11) {
      const group = await StudyGroup.getById(groupId);
      return res.render('studyGroups/join', {
        group,
        error: 'Contact number must be exactly 11 digits.',
      });
    }

    try {
      const already = await GroupMember.isMember(groupId, student_id);
      if (already) {
        const group = await StudyGroup.getById(groupId);
        return res.render('studyGroups/join', {
          group,
          error: 'A member with this Student ID has already joined this group!',
        });
      }

      await GroupMember.join({
        group_id: groupId,
        student_name,
        student_id,
        email,
        contact,
        major,
        semester,
        subject_interest,
      });

      res.redirect('/study-groups/' + groupId);
    } catch (err) {
      console.error('JOIN ERROR:', err.message);
      res.status(500).send('Server error: ' + err.message);
    }
  },
};

module.exports = groupMemberController;