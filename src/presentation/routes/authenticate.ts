import express, { Request, Response } from 'express';
import { authenticateAction } from '@application/authenticate-action';
import { MysqlUserRepository } from '@infrastructure/user/mysql-user-repository';
import { CookieAccessTokenRepository } from '@infrastructure/access-token/cookie-access-token-repository';

const router = express.Router();

router.get(
    '/auth/authenticate',
    async (req: Request, res: Response): Promise<void> => {
        const result = await authenticateAction(
            new MysqlUserRepository(),
            new CookieAccessTokenRepository(req, res),
        );
        res.status(200).send(result.jsonSerialize());
    },
);
export { router as authenticateRouter };
