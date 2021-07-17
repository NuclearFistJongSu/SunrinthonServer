import { Types } from "mongoose";
import User, { UserDocument } from "../models/User";
import { NotFoundError } from "./declarations/error";

async function getUser(id: any): Promise<UserDocument> {
    const error = NotFoundError("유저를");
        if (!Types.ObjectId.isValid(id)) throw error;

        const user = await User.findById(id);
        if (!user) throw error;

        return user;
}

export default getUser;