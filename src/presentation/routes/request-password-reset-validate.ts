import express, { Request, Response } from 'express';
import { requestPasswordResetValidateAction } from '@application/request-password-reset-validate-action';
import { CookieAccessTokenRepository } from '@infrastructure/access-token/cookie-access-token-repository';
import { MysqlUserRepository } from '@infrastructure/user/mysql-user-repository';

interface RequestParamToken extends Request {
    params: {
        token: string,
    }
}

const router = express.Router();

router.get(
    '/auth/request-password-reset-validate/:token',
    async (req: RequestParamToken, res: Response): Promise<void> => {
        const { token } = req.params;
        await requestPasswordResetValidateAction(
            new MysqlUserRepository(),
            new CookieAccessTokenRepository(req, res),
            token,
        );
        res.status(200).send();
    },
);

export { router as requestPasswordResetValidateRouter };
