import mongoose from 'mongoose';
import { ImageDocument } from './Image';

const CommentSchema = new mongoose.Schema({
    by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    contents: {
        type: String,
        required: true
    },
    vote: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get(v: Date) {
            return new Date(v.getTime() + 1000 * 60 * 60 * 9);
        }
    },
    voted_user: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'User',
        default: []
    }
});

CommentSchema.set('toJSON', {getters: true});
CommentSchema.set('toObject', {getters: true});
export const Comment = mongoose.model<CommentDocument>("Comment", CommentSchema);

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    contents: {
        type: String,
        required: true
    },
    by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    comments: {
        type: [CommentSchema],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get(v: Date) {
            return new Date(v.getTime() + 1000 * 60 * 60 * 9);
        }
    },
    portfolio_image: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Image'
    }
})

PostSchema.set('toJSON', {getters: true});
PostSchema.set('toObject', {getters: true});
export interface IComment {
    contents: string,
    by: mongoose.Types.ObjectId,
    vote: number,
    createdAt: Date,
voted_user: mongoose.Types.ObjectId[]
}
export interface IPost {
    title: string,
    contents: string,
    by: mongoose.Types.ObjectId,
    comments: CommentDocument[],
    createdAt: Date,
    portfolio_image?: mongoose.Types.ObjectId | ImageDocument
}

export interface PostDocument extends mongoose.Document, IPost {}
export interface CommentDocument extends mongoose.Document, IComment {}
const Post = mongoose.model<PostDocument>("Post", PostSchema);

export default Post;
