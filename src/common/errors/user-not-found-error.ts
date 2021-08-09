import { CustomError, SerialiseErrorsResponse } from './custom-error';

export class UserNotFoundError extends CustomError {
    statusCode = 404;

    constructor() {
        super('User Not Found');

        Object.setPrototypeOf(this, UserNotFoundError.prototype);
    }

    serializeErrors(): SerialiseErrorsResponse[] {
        return [{ message: 'User Not Found' }];
    }
}
