import express, { Request, Response } from 'express';
import { requireAuth } from '@common/middlewares/require-auth';
import { getUserSettingsAction } from '@application/settings-action';
import { MysqlUserRepository } from '@infrastructure/user/mysql-user-repository';

const router = express.Router();

router.get(
    '/settings',
    requireAuth,
    async (req: Request, res: Response): Promise<void> => {
        const userId = (req.currentUser !== undefined) ? req.currentUser.getId().getValue() : '';
        const result = await getUserSettingsAction(
            new MysqlUserRepository(),
            userId,
        );
        res.status(200).send(result.jsonSerialize());
    },
);

export { router as settingsRouter };
