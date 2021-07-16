import ExposableError from "../../classes/ExposableError";

export const InternalServerError = new ExposableError("서버에서 에러가 발생했습니다.", "SERVER_ERROR", 500);
export function validateError(message: string = "잘못된 요청입니다.") {
    return new ExposableError(message, "VALIDATE_ERROR", 400);
}
export const LoginRequiredError = new ExposableError("로그인이 필요합니다.", "LOGIN_REQUIRED_ERROR", 403);
export const BadRequestError = new ExposableError("잘못된 요청입니다.", "BAD_REQUEST_ERROR", 400);
export const NotFoundError = (prefix?: string) => new ExposableError(prefix ? `${prefix} 찾을 수 없습니다.` : `액션을 찾을 수 없습니다.`, "NOT_FOUND_ERROR", 404);
