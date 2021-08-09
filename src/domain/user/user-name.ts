import { StringValueObject } from '@domain/basic/value-object/string-value-object';

export class UserName extends StringValueObject {
    public constructor(value: string) {
        super(value, true, 1, 50, 'User name');
    }
}
