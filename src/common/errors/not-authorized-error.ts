import { CustomError, SerialiseErrorsResponse } from './custom-error';

export class NotAuthorizedError extends CustomError {
    statusCode = 401;

    constructor() {
        super('Not authorized');

        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }

    serializeErrors(): SerialiseErrorsResponse[] {
        return [{ message: 'Not authorized' }];
    }
}
