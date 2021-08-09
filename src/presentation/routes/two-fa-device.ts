import express, { Request, Response } from 'express';
import { twoFaVerifyDevice } from '@application/two-fa-device-verify-action';
import { CookieAccessTokenRepository } from '@infrastructure/access-token/cookie-access-token-repository';
import { MysqlUserRepository } from '@infrastructure/user/mysql-user-repository';
import { MysqlDeviceRepository } from '@infrastructure/device/mysql-device-repository';
import { UserOtp } from '@domain/user/user-otp';

interface RequestConfirmCode extends Request {
    body: {
        code: string,
    }
}

const router = express.Router();

router.get('/auth/2fa-device', (_req: Request, res: Response): void => {
    res.status(200).send('Provide a code from the SMS');
});

router.post('/auth/2fa-device-verify', async (req: RequestConfirmCode, res: Response): Promise<void> => {
    const { code } = req.body;
    await twoFaVerifyDevice(
        new MysqlUserRepository(),
        new CookieAccessTokenRepository(req, res),
        new MysqlDeviceRepository(),
        new UserOtp(code),
        req.headers['user-agent'] ?? '',
    );
    res.status(200).send();
});

export { router as twoFaDeviceRouter };
