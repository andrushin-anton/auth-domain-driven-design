import { CustomError, SerialiseErrorsResponse } from './custom-error';

export class InvalidTokenError extends CustomError {
    statusCode = 401;

    constructor() {
        super('Invalid token provided');

        Object.setPrototypeOf(this, InvalidTokenError.prototype);
    }

    serializeErrors(): SerialiseErrorsResponse[] {
        return [{ message: 'Invalid token provided' }];
    }
}
