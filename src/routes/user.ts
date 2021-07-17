import {Router, routes} from "../lib/decorators/router";
import {Request, Response} from "express";
import User, {IUser} from "../models/User";
import ExposableError from "../classes/ExposableError";
import TokenManager from "../classes/TokenManager";
import authMiddleware from "../lib/middlewares/auth";
import upload from "../lib/declarations/upload";
import {LoginRequiredError, NotFoundError} from "../lib/declarations/error";
import {Types} from "mongoose";
import ImageManager from "../classes/ImageManager";
import {ImageDocument} from "../models/Image";
/**
 * @swagger
 * /api/v1/user:
 *  post:
 *      summary: 회원가입
 *      tags:
 *          - User
 *      produces:
 *          - application/json
 *      parameters:
 *          - in: body
 *            name: body
 *            type: object
 *            schema:
 *              $ref: "#/schemas/SignUp"
 *      responses:
 *          200:
 *              schema:
 *                  $ref: "#/schemas/Success"
 *          500:
 *              schema:
 *                  $ref: "#/schemas/Error"
 * /api/v1/user/issue:
 *  post:
 *      summary: 로그인
 *      tags:
 *          - Auth
 *      produces:
 *          - application/json
 *      parameters:
 *          - in: body
 *            name: body
 *            type: object
 *            schema:
 *              $ref: "#/schemas/Auth"
 *      responses:
 *          200:
 *              schema:
 *                  type: object
 *                  properties:
 *                      success:
 *                          type: boolean
 *                      data:
 *                          type: string
 *                          summary: JWT 토큰
 *                  example:
 *                      success: false
 *                      data: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZjIzYzU4ZDMxOThlMDAyYzdhOGNhOCIsInVzZXJJZCI6ImZ1Y2tpbmcxMiIsInVzZXJuYW1lIjoibW90aGVyZnVjayIsImlhdCI6MTYyNjQ4ODUwOX0.qD__3haRZY2RIC1SYLYiMsV8aPr3k7Ph3IlPKKKvABg
 *          500:
 *              schema:
 *                  $ref: "#/schemas/Error"
 * /api/v1/user/:id/profile_image:
 *  get:
 *      summary: 프로필 사진을 가져옵니다. (없으면 404)
 *      tags:
 *          - User
 *      produces:
 *          - application/json
 *          - image/*
 *      responses:
 *          404:
 *              schema:
 *                  $ref: "#/schemas/ErrorProps"
 * /api/v1/user/profile_image:
 *  put:
 *      summary: 프로필 사진을 등록합니다.
 *      tags:
 *          - User
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              schema:
 *                  $ref: "#/schemas/Success"
 *      parameters:
 *          - in: body
 *            name: body
 *            type: object
 *            schema:
 *              $ref: "#/schemas/ProfilePhoto"
 *          - $ref: "#/schemas/AuthHeader"
 * /api/v1/user/:id:
 *  get:
 *      summary: 유저 정보를 가져옵니다.
 *      tags:
 *          - User
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              schema:
 *                  type: object
 *                  properties:
 *                      success:
 *                          type: boolean
 *                      data:
 *                          $ref: "#/schemas/User"

 */

@Router
class UserRoutes {
    @routes("post", "/api/v1/user")
    async signUp(req: Request, res: Response) {
        const {userId, password, username} = req.body;
        const user = new User({userId, password, username} as IUser);

        await user.save();
        res.json({
            success: true
        });
    }

    @routes("post", "/api/v1/user/issue")
    async createToken(req: Request, res: Response) {
        const {userId, password} = req.body;
        const user = await User.findOne({userId: userId});
        const error = new ExposableError("아이디가 없거나, 비밀번호가 다릅니다.", "LOGIN_FAILED", 403);
        if (!user || !user.comparePassword(password)) throw error;

        const token = TokenManager.createToken(user);

        res.json({
            success: true,
            data: token
        });
    }
 
    @routes("put", "/api/v1/user/profile_image", {
        middlewares: [authMiddleware(), upload.single("image"), ImageManager.single()]
    })
    async putProfileImage(req:Request, res: Response) {
        const user = await User.findById(res.locals.user.id);
        if (!user) throw LoginRequiredError;

        user.profile_image = res.locals.image._id;
        await user.save();
        res.json({
            success: true
        });
    }
    @routes("get", "/api/v1/user/:id")
    async getUser(req: Request, res: Response) {
        const error = NotFoundError("유저를");
        if (!Types.ObjectId.isValid(req.params.id)) throw error;

        const user = await User.findById(req.params.id, ["username"]);
        if (!user) throw error;

        const userObj = user.toObject();

        res.json({
            success: true,
            data: userObj
        });
    }
    @routes("get", "/api/v1/user/:id/profile_image")
    async getUserProfile(req: Request, res: Response) {
        const user = await User.findById(req.params.id, ['profile_image']).populate("profile_image");
        if (!user) throw NotFoundError("유저를");

        if (!user.profile_image) {
            throw NotFoundError("프로필 사진을");
        }
        const profile_image_path =  (user.profile_image as ImageDocument).path;

        res.sendFile(profile_image_path);
    }
}

export default UserRoutes;
