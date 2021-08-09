import { CustomError, SerialiseErrorsResponse } from './custom-error';

export class RequiredDeviceVerificationError extends CustomError {
    statusCode = 401;

    constructor() {
        super('Required device verification');

        Object.setPrototypeOf(this, RequiredDeviceVerificationError.prototype);
    }

    serializeErrors(): SerialiseErrorsResponse[] {
        return [{ message: 'Required device verification' }];
    }
}
