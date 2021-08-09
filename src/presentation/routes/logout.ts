import express, { Request, Response } from 'express';
import { logoutAction } from '@application/logout-action';
import { CookieAccessTokenRepository } from '@infrastructure/access-token/cookie-access-token-repository';

const router = express.Router();

router.post('/auth/logout', (req: Request, res: Response): void => {
    logoutAction(new CookieAccessTokenRepository(req, res));
    res.status(201).send();
});

export { router as logoutRouter };
