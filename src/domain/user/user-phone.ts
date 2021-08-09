import { StringValueObject } from '@domain/basic';

const PHONE_NUMBER_PATTERN = /\d/g;

export class UserPhone extends StringValueObject {
    public constructor(value: string) {
        super(
            value,
            true,
            8,
            13,
            'User phone',
            PHONE_NUMBER_PATTERN,
        );
    }
}
