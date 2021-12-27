const multer = require('multer');
const path = require('path');

exports.uploadAdd = multer({
    storage: multer.diskStorage({
        destination: 'public/uploads/',
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    })
}).single('file');