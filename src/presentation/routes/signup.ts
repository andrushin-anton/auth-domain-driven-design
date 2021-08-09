import express, { Request, Response } from 'express';
import { Required2FASetupError } from '@common/errors/required-2fa-setup-error';
import { RequiredDeviceVerificationError } from '@common/errors/required-device-verification-error';
import { CookieAccessTokenRepository } from '@infrastructure/access-token/cookie-access-token-repository';
import { signUpAction } from '@application/signup-action';
import { TwilioService } from '@infrastructure/otp/twilio-service';
import { MysqlUserRepository } from '@infrastructure/user/mysql-user-repository';
import { MysqlDeviceRepository } from '@infrastructure/device/mysql-device-repository';
import { UserOtp } from '@domain/user/user-otp';

interface RequestSignupBody extends Request {
    body: {
        email: string,
        password: string,
        confirmPassword: string,
        invitationToken: string,
    }
}

const router = express.Router();

router.post(
    '/auth/signup',
    async (req: RequestSignupBody, res: Response): Promise<void> => {
        const {
            email,
            password,
            confirmPassword,
            invitationToken,
        } = req.body;

        try {
            await signUpAction(
                new MysqlUserRepository(),
                new CookieAccessTokenRepository(req, res),
                new MysqlDeviceRepository(),
                new TwilioService(),
                email,
                password,
                confirmPassword,
                invitationToken,
                new UserOtp(),
                req.headers['user-agent'] ?? '',
            );
            res.status(201).send();
        } catch (e) {
            if (e instanceof Required2FASetupError) {
                res.redirect('/auth/2fa-setup');
                return;
            }
            if (e instanceof RequiredDeviceVerificationError) {
                res.redirect('/auth/2fa');
                return;
            }
            throw e;
        }
    },
);

export { router as signupRouter };
