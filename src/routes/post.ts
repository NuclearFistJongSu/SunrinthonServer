import { Request, Response } from "express";
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
        .populate("by", ["username", "_id", "userId"]);

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
 *      summary: 글을 가져옵니다.
 *      tags:
 *          - Post
 *      produces:
 *          - application/json
 *      parameters:
 *          - in: query
 *            name: limit
 *            summary: 글 갯수를 제한합니다.
 *            schema:
 *              type: int
 *          - in: query
 *            name: page
 *            summary: 글 갯수를 제한할 때, 페이지를 선택합니다.
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
 */
export default PostRoutes;