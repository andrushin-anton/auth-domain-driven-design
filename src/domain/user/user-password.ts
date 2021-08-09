import bcrypt from 'bcrypt';
import { StringValueObject } from '@domain/basic/value-object/string-value-object';
import { BadArgumentError } from '@common/errors/bad-argument-error';
import { User } from './user';

export class UserPassword extends StringValueObject {
    private password: string;

    private hashedPassword: string;

    public constructor(value: string) {
        super(value, true, 5, 50, 'Password');
        this.password = value;
        this.validate();
        this.hashedPassword = this.hash();
    }

    public getValue(): string {
        return this.hashedPassword;
    }

    private validate(): void {
        const uppercase = /[A-Z]/;
        const lowercase = /[a-z]/;
        const number = /[0-9]/;
        if (!uppercase.test(this.password)
        || !lowercase.test(this.password)
        || !number.test(this.password)) {
            throw new BadArgumentError('Password must contain at least one upper case letter, one lower case letter and one number');
        }
    }

    public equals(passwordToCompare: UserPassword): boolean {
        if (bcrypt.compareSync(this.password, passwordToCompare.getValue())) {
            // Passwords match
            return true;
        }
        return false;
    }

    private hash(): string {
        return bcrypt.hashSync(this.password, 1);
    }

    public userPasswordMatch(user: User): boolean {
        let hashedPassFromDb = user.getPassword();
        if (!hashedPassFromDb) {
            return false;
        }
        // due to the known buf in php hash function
        // https://stackoverflow.com/questions/23015043/verify-password-hash-in-nodejs-which-was-generated-in-php#comment99923524_27341808
        hashedPassFromDb = hashedPassFromDb.replace(/^\$2y(.+)$/i, '$2a$1');
        if (bcrypt.compareSync(this.password, hashedPassFromDb)) {
            // Passwords match
            return true;
        }
        return false;
    }
}
