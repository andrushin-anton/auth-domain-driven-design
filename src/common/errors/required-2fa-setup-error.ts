import { CustomError, SerialiseErrorsResponse } from './custom-error';

export class Required2FASetupError extends CustomError {
    statusCode = 401;

    constructor() {
        super('Required 2fa setup');

        Object.setPrototypeOf(this, Required2FASetupError.prototype);
    }

    serializeErrors(): SerialiseErrorsResponse[] {
        return [{ message: 'Required 2fa setup' }];
    }
}
