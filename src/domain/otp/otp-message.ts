import { ValueObject } from '@domain/basic';
import { UserPhone } from '@domain/user/user-phone';

export class OTPMessage implements ValueObject {
    private code: string;

    private to: string;

    private from?: string;

    public constructor(phoneTo: UserPhone, code: string) {
        this.code = code;
        this.to = `+${phoneTo.getValue()}`;
    }

    public getCode(): string {
        return this.code;
    }

    public getBody(): string {
        return `${this.code} is your ICUC Central authentication code`;
    }

    public getFrom(): string | undefined {
        return this.from;
    }

    public getTo(): string {
        return this.to;
    }

    public setFrom(phoneFrom: UserPhone): void {
        this.from = `+${phoneFrom.getValue()}`;
    }
}
