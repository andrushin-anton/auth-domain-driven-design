import { UserLockedError } from '@common/errors/user-locked-error';
import { NotAuthorizedError } from '@common/errors/not-authorized-error';
import { BadArgumentError } from '@common/errors/bad-argument-error';
import { Required2FASetupError } from '@common/errors/required-2fa-setup-error';
import { RequiredDeviceVerificationError } from '@common/errors/required-device-verification-error';
import { InvalidTokenError } from '@common/errors/invalid-token-error';
import { AccessTokenTypes } from '@domain/access-token/access-token-name';
import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { AuthToken } from '@domain/access-token/auth-token';
import { InvitationToken } from '@domain/access-token/invitation-token';
import { TwoFaSetupToken } from '@domain/access-token/twofa-setup-token';
import { VerifyCodeToken } from '@domain/access-token/verify-code-token';
import { DeviceRepository } from '@domain/device/device-repository';
import { DeviceService } from '@domain/device/device-service';
import { OTPMessage } from '@domain/otp/otp-message';
import { OtpService } from '@domain/otp/otp-service';
import { UserRepository } from '@domain/user/user-repository';
import { UserPassword } from '@domain/user/user-password';
import { UserEmail } from '@domain/user/user-email';
import { User } from '@domain/user/user';
import { UserOtp } from '@domain/user/user-otp';
import { UserPhone } from '@domain/user/user-phone';

export class AuthService {
    public async authenticate(
        userRepository: UserRepository,
        accessTokenRepository: AccessTokenRepository,
    ): Promise<User> {
        try {
            // read the auth token
            const authToken = accessTokenRepository.read(AccessTokenTypes.TOKEN_AUTH);
            // read the user by id
            const user = await userRepository.findById(authToken.getId());
            if (user.isLocked()) {
                throw new UserLockedError();
            }
            // regenerate the auth token, so while users are active in the app,
            // their session should not be interrupted
            const newAuthToken = new AuthToken(user.getId());
            accessTokenRepository.save(newAuthToken);
            return user;
        } catch (e) {
            throw new NotAuthorizedError();
        }
    }

    public async basicLogin(
        userEmail: UserEmail,
        password: UserPassword,
        userRepository: UserRepository,
        accessTokenRepository: AccessTokenRepository,
        deviceRepository: DeviceRepository,
        otpService: OtpService,
        otp: UserOtp,
        userAgent: string,
    ): Promise<void> {
        const user = await userRepository.findByEmail(userEmail);
        if (user.isLocked()) {
            throw new UserLockedError();
        }
        // verify the password
        if (!(password.userPasswordMatch(user))) {
            user.incrementLoginAttempts();
            await userRepository.save(user);
            throw new BadArgumentError('Wrong password');
        }
        // 2FA stuff, device verification
        try {
            const deviceService = new DeviceService(
                accessTokenRepository,
                deviceRepository,
                userAgent,
            );
            const device = await deviceService.getDevice(user);
            deviceService.verify(user, device);
        } catch (e) {
            if (e instanceof Required2FASetupError) {
                // add a new TOKEN_2FA_SETUP with user_id
                const token2FaSetup = new TwoFaSetupToken(user.getId());
                accessTokenRepository.save(token2FaSetup);
            }
            if (e instanceof RequiredDeviceVerificationError) {
                // add a new TOKEN_VERIFY_CODE with user_id
                const tokenVerifyCode = new VerifyCodeToken(user.getId());
                accessTokenRepository.save(tokenVerifyCode);
                // the next line is to satisfy eslint,
                // here we are sure the user's phone was set previously
                const userPhone = user.getPhone() ?? new UserPhone('');
                const otpMessage = new OTPMessage(userPhone, otp.getOtp());
                user.setOtp(otp.getValue());
                // send it to the user's phone number
                await otpService.sendMessage(otpMessage);
                // update the user
                await userRepository.save(user);
            }
            throw e;
        }
        // flush login attempts
        user.flushLoginAttempts();
        await userRepository.save(user);
        // issue a new token!
        const authToken = new AuthToken(user.getId());
        // save it to access token store (ex. cookies)
        return accessTokenRepository.save(authToken);
    }

    public async basicSignUp(
        userEmail: UserEmail,
        password: UserPassword,
        confirmPassword: UserPassword,
        userRepository: UserRepository,
        invitationTokenJWT: string,
    ): Promise<void> {
        // verify the invitation token
        const invitationToken = InvitationToken.verifyMe(invitationTokenJWT);
        // read the user by id taken from invitation token
        const user = await userRepository.findById(invitationToken.getId());
        // confirm email from param is equal to the email that was found by id from DB
        if (!user.getEmail().equals(userEmail)) {
            throw new BadArgumentError('Emails do not match');
        }
        // confirm the passwords are matching
        if (!password.equals(confirmPassword)) {
            throw new BadArgumentError('Passwords do not match');
        }
        // confirm this invitation token wasn't used before
        const lastUsedInvitationToken = user.getLastUsedInvitationToken();
        if (lastUsedInvitationToken && lastUsedInvitationToken === invitationTokenJWT) {
            throw new InvalidTokenError();
        }
        // save the password
        user.setPassword(password.getValue());
        // save the invitation token, so it can not be used again
        user.setLastUsedInvitationToken(invitationTokenJWT);
        return userRepository.save(user);
    }
}
