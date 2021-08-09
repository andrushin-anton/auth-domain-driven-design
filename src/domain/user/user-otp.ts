import bcrypt from 'bcrypt';
import { ValueObject } from '@domain/basic';
import { User } from './user';

export class UserOtp implements ValueObject {
    private otp: string;

    private hashedOtp: string;

    public constructor(value?: string) {
        if (value === undefined) {
            // eslint-disable-next-line
            value = this.generateOTP();
        }
        this.otp = value;
        this.hashedOtp = this.hash();
    }

    public getOtp(): string {
        return this.otp;
    }

    public getValue(): string {
        return this.hashedOtp;
    }

    private hash(): string {
        return bcrypt.hashSync(this.otp, 1);
    }

    public codeMatch(user: User): boolean {
        let hashedOtpFromDb = user.getOtp();
        if (!hashedOtpFromDb) {
            return false;
        }
        // due to the known buf in php hash function
        // https://stackoverflow.com/questions/23015043/verify-password-hash-in-nodejs-which-was-generated-in-php#comment99923524_27341808
        hashedOtpFromDb = hashedOtpFromDb.replace(/^\$2y(.+)$/i, '$2a$1');
        if (bcrypt.compareSync(this.otp, hashedOtpFromDb)) {
            // Passwords match
            return true;
        }
        return false;
    }

    private generateOTP() {
        // Declare a digits variable
        // which stores all digits
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < 6; i += 1) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    }
}
