import express, { Request, Response } from 'express';
import { CookieAccessTokenRepository } from '@infrastructure/access-token/cookie-access-token-repository';
import { TwilioService } from '@infrastructure/otp/twilio-service';
import { twoFaSetup } from '@application/two-fa-setup-action';
import { twoFaVerifySetup } from '@application/two-fa-setup-verify-action';
import { MysqlUserRepository } from '@infrastructure/user/mysql-user-repository';
import { MysqlDeviceRepository } from '@infrastructure/device/mysql-device-repository';
import { UserOtp } from '@domain/user/user-otp';

interface RequestUserPhone extends Request {
    body: {
        phone: string,
    }
}

interface RequestConfirmCode extends Request {
    body: {
        code: string,
    }
}

const router = express.Router();

router.get('/auth/2fa-setup', (_req: Request, res: Response): void => {
    res.status(200).send('<h2>Provide a phone number</h2>');
});

router.post('/auth/2fa-setup', async (req: RequestUserPhone, res: Response): Promise<void> => {
    const { phone } = req.body;
    await twoFaSetup(
        new MysqlUserRepository(),
        new CookieAccessTokenRepository(req, res),
        new TwilioService(),
        phone,
        new UserOtp(),
    );
    res.redirect('/auth/2fa-verify-setup');
});

router.get('/auth/2fa-verify-setup', (_req: Request, res: Response): void => {
    res.status(200).send('Provide a code from the SMS');
});

router.post('/auth/2fa-verify-setup', async (req: RequestConfirmCode, res: Response): Promise<void> => {
    const { code } = req.body;
    await twoFaVerifySetup(
        new MysqlUserRepository(),
        new CookieAccessTokenRepository(req, res),
        new MysqlDeviceRepository(),
        new UserOtp(code),
        req.headers['user-agent'] ?? '',
    );
    res.status(201).send();
});

export { router as twoFaSetupRouter };
