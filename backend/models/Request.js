const mongoose = require('mongoose');
const RequestSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    courseCode: { type: String, required: true },
    topic: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Request', RequestSchema);