import { ValidationError } from 'express-validator';
import { CustomError, SerialiseErrorsResponse } from './custom-error';

export class RequestValidationError extends CustomError {
    statusCode = 400;

    constructor(public errors: ValidationError[]) {
        super('Invalid request parameters');

        // Only because we are extending a built in class
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }

    serializeErrors(): SerialiseErrorsResponse[] {
        // eslint-disable-next-line
        return this.errors.map((err) => ({ message: err.msg, field: err.param }));
    }
}
