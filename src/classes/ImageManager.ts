import {RequestHandler} from "express";
import ExposableError from "./ExposableError";
import User from "../models/User";
import Image, {IImage} from "../models/Image";
import {BadRequestError} from "../lib/declarations/error";

class ImageManager {
    public static single(): RequestHandler {
        return (req, res, next) => {
            if (!req.file) throw BadRequestError;
            if (!req.file.mimetype.match(/^image\//)) {
                return next(new ExposableError("이미지 파일을 올려 주세요.", "INVALID_FILE_TYPE_ERROR", 400));
            }
            User.findById(res.locals.user.id)
                .then(user => {
                    const image = new Image({
                        path: req.file.path,
                        mimeType: req.file.mimetype,
                        owner: user ? user._id : undefined
                    } as IImage);

                    return image.save();
                })
                .then((image) => {
                    res.locals.image = image;
                    next();
                })
                .catch(e => next(e));
        }
    }
}

export default ImageManager;