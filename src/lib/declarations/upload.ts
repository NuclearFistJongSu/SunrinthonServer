import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import AWS from 'aws-sdk';

const s3 = new AWS.S3();
export const uploadPath = path.resolve(__dirname, '../../../uploads/');
const storage = multerS3({
    acl: 'public-read',
    s3,
    bucket: "sunrinthon",
    key(req: any,file:any, cb:any) {
        cb(null, Date.now() + file.originalname);
    }
});

const upload = multer({
    storage: storage as any
});
export default upload;