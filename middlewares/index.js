const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

exports.uploadAd = multer({
    storage: multer.diskStorage({
        destination: 'public/uploads/',
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    })
}).single('file');

exports.validateToken = (req, res, next) => {
    let authToken = req.headers.authorization;
    if (authToken) {
        authToken = authToken.split(' ')[1]; // Bearer <token>

        try {
            req.userDetails = jwt.verify(authToken, process.env.KEY);
            next();
        } catch (err) {
            res.status(403).json({ success: false, message: "Invalid auth token" });
        }
    } else {
        res.status(403).json({ success: false, message: "Token required" });
    }
}