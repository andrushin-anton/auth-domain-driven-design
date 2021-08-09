import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '@common/errors/not-authorized-error';

export const requireAuth = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    if (!req.currentUser) {
        throw new NotAuthorizedError();
    }

    next();
};
