const multer = require('multer');
const path = require('path');
const URL = require('url');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/assets'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix =Date.now() + '-' + Math.round(Math.random() * 1E9) + file.mimetype.replace('/','.');
        cb(null, uniqueSuffix)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        let fileTypes = /jpeg|jpg|png/;
        let mimeType = fileTypes.test(file.mimetype);

        let extname = fileTypes.test(path.extname(
            file.originalname).toLowerCase());

        if (mimeType && extname) {
            return cb(null, true);
        }
    }
});

module.exports = upload;