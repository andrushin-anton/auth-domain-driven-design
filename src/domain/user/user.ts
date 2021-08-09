import { Utilities } from '@common/utils';
import { Entity } from '@domain/basic/entity/entity';
import { UserEmail } from './user-email';
import { UserId } from './user-id';
import { UserName } from './user-name';
import { UserPhone } from './user-phone';

interface UserToJson {
    id: string,
    name: string,
    email: string,
}

const MAX_LOGIN_ATTEMPTS = 5;

export class User extends Entity {
    private name: UserName;

    private email: UserEmail;

    private phone?: UserPhone;

    private password?: string;

    private otp?: string;

    private otpIat?: number;

    private lastUsedInvitationToken?: string;

    private loginAttempts: number;

    private locked: boolean;

    public constructor(
        id: UserId,
        name: UserName,
        email: UserEmail,
        userPassword?: string,
        userPhone?: UserPhone,
        lastUsedInvitationToken?: string,
        loginAttempts?: number,
        locked?: boolean,
        otp?: string,
        otpIat?: number,
    ) {
        super(id);
        this.name = name;
        this.email = email;
        if (userPhone) {
            this.phone = userPhone;
        }
        if (userPassword) {
            this.password = userPassword;
        }
        if (lastUsedInvitationToken) {
            this.lastUsedInvitationToken = lastUsedInvitationToken;
        }
        if (otp) {
            this.otp = otp;
        }
        if (otpIat) {
            this.otpIat = otpIat;
        }
        this.loginAttempts = loginAttempts ?? 0;
        this.locked = locked ?? false;
    }

    public getName(): UserName {
        return this.name;
    }

    public getEmail(): UserEmail {
        return this.email;
    }

    public getPhone(): UserPhone | undefined {
        return (this.phone) ? this.phone : undefined;
    }

    public getPhoneAsString(): string | null {
        return (this.phone) ? this.phone.getValue() : null;
    }

    public setPhone(userPhone: UserPhone): void {
        this.phone = userPhone;
    }

    public getPassword(): string | undefined {
        return this.password;
    }

    public setPassword(password: string): void {
        this.password = password;
    }

    public getOtp(): string | undefined {
        return this.otp;
    }

    public getOtpIat(): number | undefined {
        return this.otpIat;
    }

    public setOtp(otp: string): void {
        this.otp = otp;
        // lifetime is 5 minutes
        this.otpIat = Utilities.addMinutes(5);
    }

    public getLastUsedInvitationToken(): string | undefined {
        return this.lastUsedInvitationToken;
    }

    public setLastUsedInvitationToken(jwt: string): void {
        this.lastUsedInvitationToken = jwt;
    }

    public isLocked(): boolean {
        return this.locked;
    }

    public getLoginAttempts(): number {
        return this.loginAttempts;
    }

    public incrementLoginAttempts(): void {
        this.loginAttempts += 1;
        if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            this.locked = true;
        }
    }

    public flushLoginAttempts(): void {
        this.loginAttempts = 0;
    }

    serialize(object: UserToJson): UserToJson {
        const retObject = object;
        retObject.name = this.name.getValue();
        retObject.email = this.email.getValue();
        return retObject;
    }
}
