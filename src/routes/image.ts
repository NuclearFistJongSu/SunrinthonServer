import {Router, routes} from "../lib/decorators/router";
import {Request, Response} from "express";
import upload from "../lib/declarations/upload";
import ImageManager from "../classes/ImageManager";
import authMiddleware from "../lib/middlewares/auth";
import {isValidObjectId} from "mongoose";
import {BadRequestError, NotFoundError} from "../lib/declarations/error";
import Image from "../models/Image";

@Router
class ImageRoutes {
    @routes("post", "/api/v1/image", {
        middlewares: [authMiddleware(), upload.single("image"), ImageManager.single()]
    })
    postImage(req: Request, res: Response) {
        res.json({
            success: true,
            data: {
                url: '/api/v1/image/' + res.locals.image._id,
                imageId: res.locals.image._id
            }
        });
    }
    @routes("get", "/api/v1/image/:id")
    async getImage(req: Request, res: Response) {
        const id = req.params.id;
        if (!id || !isValidObjectId(id)) throw BadRequestError;
        const image = await Image.findById(id);
        if (!image) throw NotFoundError("이미지를");

        res.sendFile(image.path);
    }
}

export default ImageRoutes;