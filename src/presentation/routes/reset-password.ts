import express, { Request, Response } from 'express';
import { resetPasswordAction } from '@application/reset-user-password-action';
import { MysqlUserRepository } from '@infrastructure/user/mysql-user-repository';
import { CookieAccessTokenRepository } from '@infrastructure/access-token/cookie-access-token-repository';

interface RequestResetPassword extends Request {
    body: {
        newPassword: string,
        confirmPassword: string,
    }
}

const router = express.Router();

router.post(
    '/auth/reset-password',
    async (req: RequestResetPassword, res: Response): Promise<void> => {
        const { newPassword, confirmPassword } = req.body;
        await resetPasswordAction(
            new MysqlUserRepository(),
            new CookieAccessTokenRepository(req, res),
            newPassword,
            confirmPassword,
        );
        res.status(200).send();
    },
);

export { router as resetPasswordRouter };
