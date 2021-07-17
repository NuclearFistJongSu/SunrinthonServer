import { Request, Response } from "express";
import { NotFoundError } from "../lib/declarations/error";
import {Router, routes} from "../lib/decorators/router";
import getUser from "../lib/getUser";
import authMiddleware from "../lib/middlewares/auth";
import Post from "../models/Post";


@Router
class PostRoutes {
    @routes("post", "/api/v1/post", {middlewares: [authMiddleware()]})
    async createPost(req: Request, res: Response) {
        const {title, contents} = req.body;
        const userId = res.locals.user.id;
        const user = await getUser(userId);

        const post = new Post({
            title,
            contents,
            by: user._id
        });

        await post.save();

        res.json({
            success: true,
            data: post.toObject()
        });
    }

    @routes("get", "/api/v1/post")
    async getPosts(req: Request, res: Response) {
        const {limit, page} = req.query;

        const posts = Post.find({}, ["title, by"])
        .populate("by", ["username", "_id", "userId", "createdAt", "isExpert", "information", "career"]);

        if (limit) {
            const p: any = page ? page : 1;
            posts.limit(parseInt(limit as any)).skip(limit as any * (p - 1));
        }

        const data = await posts.exec();

        res.json({
            success: true,
            data
        });
    }
    
    @routes("get", "/api/v1/post/:id")
    async getPost(req: Request, res: Response) {
        const post = await this.getPostFromDB(req.params.id);
        
        res.json({
            success: true,
            data: post
        });
    }
    private async getPostFromDB(id: string) {
        const error = NotFoundError("글을");
        const post = await Post.findById(id).populate("by", ["username", "_id", "userId", "createdAt", "isExpert", "information", "career"]).exec();

        if (!post) throw error;

        return post;
    }
}
/**
 * @swagger
 * /api/v1/post:
 *  post:
 *      summary: 글을 올립니다.
 *      tags:
 *          - Post
 *      produces:
 *          - application/json
 *      parameters:
 *        - in: body
 *          name: body
 *          type: object
 *          schema:
 *              type: object
 *              properties:
 *                  title:
 *                      type: string
 *                  contents:
 *                      type: string
 *        - $ref: "#/schemas/AuthHeader"
 *      responses:
 *          200:
 *              schema:
 *                  type: object
 *                  properties:
 *                      success:
 *                          type: boolean
 *                      data:
 *                          $ref: "#/definitions/Post"
 *  get:
 *      summary: 글 목록을 가져옵니다.
 *      tags:
 *          - Post
 *      produces:
 *          - application/json
 *      parameters:
 *          - in: query
 *            name: limit
 *            description: 글 갯수를 제한합니다.
 *            schema:
 *              type: int
 *          - in: query
 *            name: page
 *            description: 글 갯수를 제한할 때, 페이지를 선택합니다.
 *            schema:
 *              type: int
 *      responses:
 *          200:
 *              schema:
 *                  type: object
 *                  properties:
 *                      success:
 *                          type: boolean
 *                      data:
 *                          type: array
 *                          items:
 *                              $ref: "#/definitions/Post"
 * /api/v1/post/:id:
 *  get:
 *      summary: 글을 가져옵니다.
 *      tags:
 *          - Post
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
 *                          $ref: "#/definitions/Post"
 */
export default PostRoutes;