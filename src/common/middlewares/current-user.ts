import { Request, Response, NextFunction } from 'express';
import { AccessTokenTypes } from '@domain/access-token/access-token-name';
import { AuthToken } from '@domain/access-token/auth-token';
import { CookieAccessTokenRepository } from '@infrastructure/access-token/cookie-access-token-repository';

/* eslint-disable */
declare global {
    namespace Express {
        interface Request {
            currentUser?: AuthToken;
        }
    }
}

export const currentUser = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.cookies[AccessTokenTypes.TOKEN_AUTH]) {
        return next();
    }

    try {
        const cookieAccessTokenRepository = new CookieAccessTokenRepository(req, res);
        req.currentUser = cookieAccessTokenRepository.read(AccessTokenTypes.TOKEN_AUTH);
    } catch (err) {}

    next();
};
/* eslint-enable */
