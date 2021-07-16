import User, {UserDocument} from "../models/User";
import JWT, {JsonWebTokenError} from 'jsonwebtoken';
import ExposableError from "./ExposableError";

interface TokenPayload {id: string, userId: string, username: string, iat: string}

class TokenManager {
    public static createToken(user: UserDocument) {
        return JWT.sign({id: user._id, userId: user.userId, username: user.username}, user.encKey).toString();
    }
    public static decodeToken(token: string) {
        return JWT.decode(token) as TokenPayload;
    }
    public static async verifyToken(token: string) {
        const decoded = this.decodeToken(token);
        const user = await User.findById(decoded.id);

        const error = new ExposableError("올바른 토큰이 아닙니다.", "TOKEN_INVALID", 400);
        if (!user) throw error;

        try {
            await JWT.verify(token, user.encKey);
        } catch (e) {
            if (e.name === "TokenExpiredError") throw new ExposableError("토큰이 만료되었습니다.", "TOKEN_EXPIRED", 400);
            throw error;
        }
        return decoded;
    }
}

export default TokenManager;