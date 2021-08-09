import { BadRequestError } from '@common/errors/bad-request-error';
import { ValueObject } from './value-object';

export abstract class StringValueObject implements ValueObject {
    private value: string;

    private label: string;

    public constructor(
        value: string,
        trim = true,
        minLength = 0,
        maxLength = 65535,
        label = 'value',
        pattern?: RegExp,
    ) {
        if (!value) {
            throw new BadRequestError('Missing required param');
        }
        let incomingValue = value;
        if (trim) {
            incomingValue = incomingValue.trim();
        }
        const { length } = incomingValue;
        if (length < minLength) {
            throw new BadRequestError(`The ${label} cannot be less than ${minLength} character(s)`);
        }
        if (length > maxLength) {
            throw new BadRequestError(`The ${label} cannot be more than ${maxLength} character(s)`);
        }
        if (pattern !== undefined && pattern.exec(incomingValue) === null) {
            throw new BadRequestError(`The ${label} must match the pattern: ${pattern.toString()}`);
        }
        this.value = incomingValue;
        this.label = label;
    }

    public getValue(): string {
        return this.value;
    }

    public getLabel(): string {
        return this.label;
    }
}
