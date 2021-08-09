import { BadRequestError } from '@common/errors/bad-request-error';
import { StringValueObject } from '@domain/basic';

export class UserEmail extends StringValueObject {
    private email: string;

    public constructor(value: string) {
        super(
            value,
            true,
            1,
            50,
            'Email',
        );
        if (!this.emailIsValid(value)) {
            throw new BadRequestError('Email is invalid');
        }
        this.email = value;
    }

    private emailIsValid(email: string) {
        return /\S+@\S+\.\S+/.test(email);
    }

    public equals(email: UserEmail): boolean {
        return this.email === email.getValue();
    }
}
