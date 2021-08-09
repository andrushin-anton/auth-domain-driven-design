import { BadRequestError } from '@common/errors/bad-request-error';
import { ValueObject } from './value-object';

export class DateTimeValueObject implements ValueObject {
    private value?: Date;

    public constructor(value?: string) {
        if (value !== undefined) {
            try {
                this.value = new Date(value);
            } catch (e) {
                throw new BadRequestError('Invalid date provided');
            }
        }
    }

    public getValue(): Date | undefined {
        return this.value;
    }

    public toString(): string {
        const date = this.getValue();
        if (date) {
            return date.toDateString();
        }
        return 'null';
    }
}
