import multer from 'multer';
import path from 'path';

export const uploadPath = path.resolve(__dirname, '../../../uploads/');
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadPath);
    },
    filename(req,file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

const upload = multer({
    storage
});
export default upload;