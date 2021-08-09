import express, { Request, Response } from 'express';
import { MysqlUserRepository } from '@infrastructure/user/mysql-user-repository';
import { sendInvitationToken } from '@application/invitation-token-action';
import { InMemoryPublisher } from '@infrastructure/event/in-memory-publisher';

interface RequestUserEmail extends Request {
    body: {
        email: string,
    }
}

const router = express.Router();

router.post('/auth/invitation', async (req: RequestUserEmail, res: Response): Promise<void> => {
    const { email } = req.body;
    await sendInvitationToken(
        email,
        new MysqlUserRepository(),
        new InMemoryPublisher(),
    );
    res.status(201).send();
});

export { router as invitationRouter };
