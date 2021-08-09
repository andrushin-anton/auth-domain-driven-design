import express, { Request, Response } from 'express';
import { InMemoryPublisher } from '@infrastructure/event/in-memory-publisher';
import { requestPasswordResetAction } from '@application/request-password-reset-action';
import { MysqlUserRepository } from '@infrastructure/user/mysql-user-repository';
import { UserEmail } from '@domain/user/user-email';

interface RequestUserEmail extends Request {
    body: {
        email: string,
    }
}

const router = express.Router();

router.post(
    '/auth/request-password-reset',
    async (req: RequestUserEmail, res: Response): Promise<void> => {
        const { email } = req.body;
        const host = (req.headers.host !== undefined) ? req.headers.host : '';
        await requestPasswordResetAction(
            new MysqlUserRepository(),
            new UserEmail(email),
            new InMemoryPublisher(),
            host,
        );
        res.status(200).send();
    },
);
export { router as requestPasswordRouter };
