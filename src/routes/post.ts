import { Request, Response } from "express";
import { NotFoundError } from "../lib/declarations/error";
import {Router, routes} from "../lib/decorators/router";
import getUser from "../lib/getUser";
import authMiddleware from "../lib/middlewares/auth";
import Post, { Comment } from "../models/Post";
import axios from 'axios';
import _ from "lodash";
import Image from "../models/Image";
import ExposableError from "../classes/ExposableError";

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
            by: user._id,
            portfolio_image: user.portfolio_image
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

        const posts = Post.find()
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
    @routes("get", "/api/v1/post/:id/portfolio_image")
    async getPostImage(req: Request, res: Response) {
        const post = await this.getPostFromDB(req.params.id);
        if (!post.portfolio_image) {
            throw NotFoundError("??????????????? ?????????");
        }
        const image = await Image.findById(post.portfolio_image);
        if (!image) {
            throw NotFoundError("??????????????? ?????????");
        }
        const portfolio_image_path =  (image).path;

        const {data} = await axios.get(portfolio_image_path, {responseType: "stream"});
        data.pipe(res);
    }
    @routes("post", "/api/v1/post/:id/comment", {middlewares: [authMiddleware()]})
    async postComment(req: Request, res: Response) {
        const {contents} = req.body;
        const post = await this.getPostFromDB(req.params.id);
        const comment = new Comment({
            contents,
            by: res.locals.user.id
        });
        
        post.comments.push(comment);
        await post.save();

        res.json({
            success: true,
            data: post
        });
    }
    @routes("put", "/api/v1/post/:id/comment/:comment_id/vote", {middlewares: [authMiddleware()]})
    async voteComment(req: Request, res: Response) {
        const post = await this.getPostFromDB(req.params.id);

        const idx = _.findIndex(post.comments, (o) => o._id == req.params.comment_id);
        if (idx === -1) throw NotFoundError("?????????");
        if (post.comments[idx].voted_user.filter((o) => o == res.locals.user.id).length > 0)
            throw new ExposableError("?????? ?????????????????????.", "ALREADY_VOTED_ERROR", 400);
        
        post.comments[idx].vote += 1;
        post.comments[idx].voted_user.push(res.locals.user.id);

        await post.save();

        post.comments = _.sortBy(post.comments, "vote").reverse();
        res.json({
            success: true,
            data: post
        });
    }
    private async getPostFromDB(id: string) {
        const error = NotFoundError("??????");
        const post = await Post.findById(id)
        .populate("comments.by", ["username", "_id", "userId", "createdAt", "isExpert", "information", "career"])
        .populate("by", ["username", "_id", "userId", "createdAt", "isExpert", "information", "career"])
        .exec();

        if (!post) throw error;

        post.comments = _.sortBy(post.comments, "vote").reverse();
        return post;
    }
}
/**
 * @swagger
 * /api/v1/post:
 *  post:
 *      summary: ?????? ????????????.
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
 *      summary: ??? ????????? ???????????????.
 *      tags:
 *          - Post
 *      produces:
 *          - application/json
 *      parameters:
 *          - in: query
 *            name: limit
 *            description: ??? ????????? ???????????????.
 *            schema:
 *              type: int
 *          - in: query
 *            name: page
 *            description: ??? ????????? ????????? ???, ???????????? ???????????????.
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
 * /api/v1/post/{id}:
 *  get:
 *      summary: ?????? ???????????????.
 *      tags:
 *          - Post
 *      produces:
 *          - application/json
 *      parameters:
 *        - in: path
 *          name: id
 *          type: string
 *      responses:
 *          200:
 *              schema:
 *                  type: object
 *                  properties:
 *                      success:
 *                          type: boolean
 *                      data:
 *                          $ref: "#/definitions/Post"
 * /api/v1/post/{id}/portfolio_image:
 *  get:
 *      summary: ??????????????? ????????? ???????????????. (????????? 404)
 *      tags:
 *          - Post
 *      produces:
 *          - application/json
 *          - image/*
 *      parameters:
 *        - in: path
 *          name: id
 *          type: string
 *      responses:
 *          404:
 *              schema:
 *                  $ref: "#/schemas/ErrorProps"
 * /api/v1/post/{id}/comment:
 *  post:
 *      summary: ????????? ?????????.
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
 *                  contents:
 *                      type: string
 *        - in: path
 *          name: id
 *          type: string
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
 * /api/v1/post/{id}/comment/{comment_id}/vote:
 *  put:
 *      summary: ????????? ????????? ?????????. (??? ????????? ?????? ??????!)
 *      tags:
 *          - Post
 *      produces:
 *          - application/json
 *      parameters:
 *        - in: path
 *          name: id
 *          type: string
 *          description: ?????? _id
 *        - in: path
 *          name: comment_id
 *          type: string
 *          description: ????????? _id
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
 *          500:
 *              schema:
 *                  $ref: "#/schemas/Error"
 */
export default PostRoutes;