import express, { Request, Response } from 'express';
import { requireAuth } from '@common/middlewares/require-auth';
import { MysqlUserRepository } from '@infrastructure/user/mysql-user-repository';
import { updateUserPassword } from '@application/update-user-password-action';

interface RequestUserSettingsBody extends Request {
    body: {
        newPassword: string,
        newPasswordConfirm: string,
        oldPassword: string,
    }
}

const router = express.Router();

router.post(
    '/settings/pswd',
    requireAuth,
    async (req: RequestUserSettingsBody, res: Response): Promise<void> => {
        const { newPassword, newPasswordConfirm, oldPassword } = req.body;
        const userId = (req.currentUser !== undefined) ? req.currentUser.getId().getValue() : '';
        await updateUserPassword(
            new MysqlUserRepository(),
            userId,
            newPassword,
            newPasswordConfirm,
            oldPassword,
        );
        res.status(200).send();
    },
);

export { router as settingsPasswordUpdateRouter };
