const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('config');
const path = require('path');

const s3 = new aws.S3({
    accessKeyId: config.get('aws.awsAccessKey'),
    secretAccessKey: config.get('aws.awsSecretKey'),
    region:'us-east-1',
    Bucket: config.get('aws.s3BucketName'),
});
const s3BucketUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.get('aws.s3BucketName'),
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + file.mimetype.replace('/', '.');
            cb(null, uniqueSuffix)
        }
    }),
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

module.exports = s3BucketUpload;