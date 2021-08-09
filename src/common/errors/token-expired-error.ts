import { CustomError, SerialiseErrorsResponse } from './custom-error';

export class TokenExpiredError extends CustomError {
    statusCode = 401;

    constructor() {
        super('Token has expired');

        Object.setPrototypeOf(this, TokenExpiredError.prototype);
    }

    serializeErrors(): SerialiseErrorsResponse[] {
        return [{ message: 'Token has expired' }];
    }
}
