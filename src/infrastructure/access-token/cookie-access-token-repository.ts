import {
    Request,
    Response,
} from 'express';
import { AccessTokenTypes } from '@domain/access-token/access-token-name';
import { AuthToken } from '@domain/access-token/auth-token';
import { AccessToken } from '@domain/access-token/access-token';
import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { DeviceToken } from '@domain/access-token/device-token';
import { TwoFaSetupToken } from '@domain/access-token/twofa-setup-token';
import { VerifyCodeToken } from '@domain/access-token/verify-code-token';
import { PasswordResetToken } from '@domain/access-token/password-reset-token';
import { CookieNotFoundError } from '@common/errors/cookie-not-found-error';

export class CookieAccessTokenRepository implements AccessTokenRepository {
    private request: Request;

    private response: Response;

    private options = {
        maxAge: (3600 * 24 * 30) * 1000, // 30 days
        httpOnly: false, // The cookie only accessible by the web server
        signed: false, // Indicates if the cookie should be signed
    };

    constructor(request: Request, response: Response) {
        this.request = request;
        this.response = response;
    }

    public save(accessToken: AccessToken): void {
        // get the name of the token
        const authTokenName = accessToken.getName().getValue();
        // save the cookie with provided token name, ex. one of the AccessTokenTypes
        this.response.cookie(authTokenName, accessToken.getJWT(), this.options);
    }

    public delete(tokenName: string): void {
        this.response.clearCookie(tokenName);
    }

    public read(accessTokenType: AccessTokenTypes): AccessToken {
        switch (accessTokenType) {
            case AccessTokenTypes.TOKEN_AUTH:
                // eslint-disable-next-line
                if (!this.request.cookies[AccessTokenTypes.TOKEN_AUTH]) {
                    throw new CookieNotFoundError(`Cookie: ${AccessTokenTypes.TOKEN_AUTH} not found`);
                }
                // eslint-disable-next-line
                return AuthToken.verifyMe(this.request.cookies[AccessTokenTypes.TOKEN_AUTH]);
            case AccessTokenTypes.TOKEN_DEVICE:
                // eslint-disable-next-line
                if (!this.request.cookies[AccessTokenTypes.TOKEN_DEVICE]) {
                    throw new CookieNotFoundError(`Cookie: ${AccessTokenTypes.TOKEN_DEVICE} not found`);
                }
                // eslint-disable-next-line
                return DeviceToken.verifyMe(this.request.cookies[AccessTokenTypes.TOKEN_DEVICE]);
            case AccessTokenTypes.TOKEN_2FA_SETUP:
                // eslint-disable-next-line
                if (!this.request.cookies[AccessTokenTypes.TOKEN_2FA_SETUP]) {
                    throw new CookieNotFoundError(`Cookie: ${AccessTokenTypes.TOKEN_2FA_SETUP} not found`);
                }
                // eslint-disable-next-line
                return TwoFaSetupToken.verifyMe(this.request.cookies[AccessTokenTypes.TOKEN_2FA_SETUP]);
            case AccessTokenTypes.TOKEN_VERIFY_CODE:
                // eslint-disable-next-line
                if (!this.request.cookies[AccessTokenTypes.TOKEN_VERIFY_CODE]) {
                    throw new CookieNotFoundError(`Cookie: ${AccessTokenTypes.TOKEN_VERIFY_CODE} not found`);
                }
                // eslint-disable-next-line
                return VerifyCodeToken.verifyMe(this.request.cookies[AccessTokenTypes.TOKEN_VERIFY_CODE]);
            case AccessTokenTypes.TOKEN_PSWD_RESET:
                // eslint-disable-next-line
                if (!this.request.cookies[AccessTokenTypes.TOKEN_PSWD_RESET]) {
                    throw new CookieNotFoundError(`Cookie: ${AccessTokenTypes.TOKEN_PSWD_RESET} not found`);
                }
                // eslint-disable-next-line
                return PasswordResetToken.verifyMe(this.request.cookies[AccessTokenTypes.TOKEN_PSWD_RESET]);
            default:
                throw new CookieNotFoundError(`Cookie: ${accessTokenType} not found`);
        }
    }
}
