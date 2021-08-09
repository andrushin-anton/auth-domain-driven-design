import { CustomError, SerialiseErrorsResponse } from './custom-error';

export class BadRequestError extends CustomError {
    statusCode = 400;

    constructor(public message: string) {
        super(message);

        Object.setPrototypeOf(this, BadRequestError.prototype);
    }

    serializeErrors(): SerialiseErrorsResponse[] {
        return [{ message: this.message }];
    }
}
