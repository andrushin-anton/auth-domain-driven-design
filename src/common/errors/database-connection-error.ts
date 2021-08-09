import { CustomError, SerialiseErrorsResponse } from './custom-error';

export class DatabaseConnectionError extends CustomError {
    statusCode = 500;

    reason = 'Error connecting to database';

    constructor() {
        super('Error connecting to db');

        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }

    serializeErrors(): SerialiseErrorsResponse[] {
        return [{ message: this.reason }];
    }
}
