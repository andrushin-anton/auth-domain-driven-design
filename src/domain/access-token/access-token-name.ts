export enum AccessTokenTypes {
    TOKEN_AUTH = 'auth',
    TOKEN_2FA_SETUP = 's2fa',
    TOKEN_VERIFY_CODE = 'v2fa',
    TOKEN_PSWD_RESET = 'rpwd',
    TOKEN_INVITATION = 'inivtation',
    TOKEN_DEVICE = 'device',
}

export class AccessTokenName {
    private name;

    public constructor(value: AccessTokenTypes) {
        this.name = value;
    }

    public getValue(): string {
        return this.name;
    }
}
