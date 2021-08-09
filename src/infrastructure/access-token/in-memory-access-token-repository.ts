import { CookieNotFoundError } from '@common/errors/cookie-not-found-error';
import { AccessToken } from '@domain/access-token/access-token';
import { AccessTokenTypes } from '@domain/access-token/access-token-name';
import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { AuthToken } from '@domain/access-token/auth-token';
import { DeviceToken } from '@domain/access-token/device-token';
import { PasswordResetToken } from '@domain/access-token/password-reset-token';
import { TwoFaSetupToken } from '@domain/access-token/twofa-setup-token';
import { VerifyCodeToken } from '@domain/access-token/verify-code-token';

/**
 * This repository is used only by tests
 */
/* eslint-disable */
export class InMemoryAccessTokenRepository implements AccessTokenRepository {
    private request: any;
    private response: any;

    constructor(request: any, response: any) {
        this.request = request;
        this.response = response;
    }

    public save(accessToken: AccessToken): void {
        // get the name of the token
        const authTokenName = accessToken.getName().getValue();
        // save the cookie with provided token name, ex. one of the AccessTokenTypes
        this.response[authTokenName] = accessToken.getJWT();
        this.request[authTokenName] = accessToken.getJWT();
    }

    public delete(tokenName: string): void {
        this.response[tokenName] = null;
    }

    public read(accessTokenType: AccessTokenTypes): AccessToken {
        switch (accessTokenType) {
            case AccessTokenTypes.TOKEN_AUTH:
                if (!this.request[AccessTokenTypes.TOKEN_AUTH]) {
                    throw new CookieNotFoundError(`Cookie: ${AccessTokenTypes.TOKEN_AUTH} not found`);
                }
                return AuthToken.verifyMe(this.request[AccessTokenTypes.TOKEN_AUTH]);
            case AccessTokenTypes.TOKEN_DEVICE:
                if (!this.request[AccessTokenTypes.TOKEN_DEVICE]) {
                    throw new CookieNotFoundError(`Cookie: ${AccessTokenTypes.TOKEN_DEVICE} not found`);
                }
                return DeviceToken.verifyMe(this.request[AccessTokenTypes.TOKEN_DEVICE]);
            case AccessTokenTypes.TOKEN_2FA_SETUP:
                if (!this.request[AccessTokenTypes.TOKEN_2FA_SETUP]) {
                    throw new CookieNotFoundError(`Cookie: ${AccessTokenTypes.TOKEN_2FA_SETUP} not found`);
                }
                return TwoFaSetupToken.verifyMe(this.request[AccessTokenTypes.TOKEN_2FA_SETUP]);
            case AccessTokenTypes.TOKEN_VERIFY_CODE:
                if (!this.request[AccessTokenTypes.TOKEN_VERIFY_CODE]) {
                    throw new CookieNotFoundError(`Cookie: ${AccessTokenTypes.TOKEN_VERIFY_CODE} not found`);
                }
                return VerifyCodeToken.verifyMe(this.request[AccessTokenTypes.TOKEN_VERIFY_CODE]);
            case AccessTokenTypes.TOKEN_PSWD_RESET:
                if (!this.request[AccessTokenTypes.TOKEN_PSWD_RESET]) {
                    throw new CookieNotFoundError(`Cookie: ${AccessTokenTypes.TOKEN_PSWD_RESET} not found`);
                }
                return PasswordResetToken.verifyMe(this.request[AccessTokenTypes.TOKEN_PSWD_RESET]);
        }
        throw new CookieNotFoundError(`Cookie: ${accessTokenType} not found`);
    }

    getResponse(): any {
        return this.response;
    }

    getRequest(): any {
        return this.request;
    }
}
/* eslint-enable */
