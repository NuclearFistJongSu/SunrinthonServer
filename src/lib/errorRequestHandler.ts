import {ErrorRequestHandler} from "express";
import ExposableError from "../classes/ExposableError";
import {InternalServerError, validateError} from "./declarations/error";

const errorRequestHandler: ErrorRequestHandler = (err, req, res, next) => {
    let error: ExposableError = err;
    if (error.name === 'ValidationError') {
        const message = Object.values(err.errors).map((v: any) => v.message).join('\n');

        error = validateError(message);
    } else if (error.name !== 'ExposableError') {
        console.error(err.stack);
        error = InternalServerError;
    }

    res.status(error.status);
    res.json({
        success: false,
        code: error.code,
        message: error.message
    });
}

export default errorRequestHandler;