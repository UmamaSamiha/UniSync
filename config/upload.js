const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'public/uploads/thesis';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

// Accept PDF by MIME type OR by file extension (Windows fix)
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/pdf',
        'application/x-pdf',
        'application/acrobat',
        'application/vnd.pdf',
        'text/pdf',
        'text/x-pdf'
    ];

    const extname = path.extname(file.originalname).toLowerCase() === '.pdf';

    if (allowedMimes.includes(file.mimetype) || extname) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files allowed'), false);
    }
};
module.exports = multer({ storage, fileFilter });