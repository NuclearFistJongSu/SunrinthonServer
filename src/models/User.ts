import mongoose from 'mongoose';
import crypto from 'crypto';
import uniqueValidator from 'mongoose-unique-validator';
import {ImageDocument} from "./Image";

const userSchema = new mongoose.Schema({
   userId: {
       type: String,
       required: [true, '`userId` 필드가 비어 있습니다.'],
       unique: true,
       minlength: [6, '아이디는 여섯 자 이상이어야 합니다.'],
       maxlength: [24, '아이디는 24자 이하여야 합니다.']
   },
    password: {
       type: String,
        required: [true, "`password` 필드가 비어 있습니다."],
        set<String>(value: string) {
           const encKey = crypto.randomBytes(64).toString('base64');

           (this as any).encKey = encKey;
           return crypto.pbkdf2Sync(value, encKey, 100000, 64, 'sha512').toString('base64');
        }
    },
    encKey: {
       type: String
    },
    username: {
       type: String,
        required: [true, "`username` 필드가 비어 있습니다."],
    },
    profile_image: {
       type: mongoose.SchemaTypes.ObjectId,
        ref: 'Image'
    },
    createdAt: {
       type: Date,
        default: Date.now
    }
});

userSchema.methods.comparePassword = function (this:UserDocument, password: string) {
    const passwordEncrypted = crypto.pbkdf2Sync(password, this.encKey, 100000, 64, 'sha512').toString('base64');

    return this.password === passwordEncrypted;
};
userSchema.plugin(uniqueValidator, {message: "이미 존재하는 회원입니다."});

export interface IUser {
    userId: string,
    password: string,
    username: string,
    profile_image?: mongoose.Types.ObjectId | ImageDocument
}
export interface UserDocument extends mongoose.Document, IUser{
    createdAt: Date;
    encKey: string;
    comparePassword(password: string): boolean;
}
const User = mongoose.model<UserDocument>('User', userSchema);

export default User;