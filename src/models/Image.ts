import mongoose from "mongoose";

const imageSchema: any = new mongoose.Schema({
    path: {
        type: String,
        required: [true, "Image path는 반드시 필요합니다."]
    },
    mimeType: {
        type: String,
        required: [true, "mimetype을 넣어주세요."]
    },
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }
});

export interface IImage {
    path: string,
    mimeType: string,
    owner?: mongoose.Types.ObjectId
}

export interface ImageDocument extends mongoose.Document, IImage {
}

const Image = mongoose.model<ImageDocument>("Image", imageSchema);

export default Image;