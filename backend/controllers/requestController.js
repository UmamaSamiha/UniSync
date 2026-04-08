const Request = require('../models/Request');
exports.createRequest = async (req, res) => {
    try {
        const newRequest = new Request(req.body);
        await newRequest.save();
        res.status(201).json({ message: "Request Created!", data: newRequest });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};