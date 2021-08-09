import { CustomError, SerialiseErrorsResponse } from './custom-error';

export class CookieNotFoundError extends CustomError {
    statusCode = 400;

    constructor(public message: string) {
        super(message);

        Object.setPrototypeOf(this, CookieNotFoundError.prototype);
    }

    serializeErrors(): SerialiseErrorsResponse[] {
        return [{ message: this.message }];
    }
}
