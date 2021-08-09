import express, { Request, Response } from 'express';
import { requireAuth } from '@common/middlewares/require-auth';
import { UserPhone } from '@domain/user/user-phone';
import { UserId } from '@domain/user/user-id';
import { UserOtp } from '@domain/user/user-otp';
import { MysqlUserRepository } from '@infrastructure/user/mysql-user-repository';
import { requestPhoneChange } from '@application/request-phone-change';
import { CookieAccessTokenRepository } from '@infrastructure/access-token/cookie-access-token-repository';
import { TwilioService } from '@infrastructure/otp/twilio-service';
import { requestPhoneChangeVerify } from '@application/request-phone-change-verify';

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

router.post(
    '/settings/phone',
    requireAuth,
    async (req: RequestUserPhone, res: Response): Promise<void> => {
        const { phone } = req.body;
        const userId = (req.currentUser !== undefined) ? req.currentUser.getId().getValue() : '';
        await requestPhoneChange(
            new MysqlUserRepository(),
            new CookieAccessTokenRepository(req, res),
            new TwilioService(),
            new UserPhone(phone),
            new UserId(userId),
            new UserOtp(),
        );
        res.redirect('/settings/phone-verify');
    },
);

router.post(
    '/settings/phone-verify',
    requireAuth,
    async (req: RequestConfirmCode, res: Response): Promise<void> => {
        const { code } = req.body;
        await requestPhoneChangeVerify(
            new MysqlUserRepository(),
            new CookieAccessTokenRepository(req, res),
            new UserOtp(code),
        );
        res.status(200).send();
    },
);

export { router as settingsPhoneUpdateRouter };
