import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { UserRepository } from '@domain/user/user-repository';
import { UserOtp } from '@domain/user/user-otp';
import { UserEmail } from '@domain/user/user-email';
import { UserPassword } from '@domain/user/user-password';
import { DeviceRepository } from '@domain/device/device-repository';
import { AuthService } from '@domain/auth/auth-service';
import { OtpService } from '@domain/otp/otp-service';

export async function signUpAction(
    userRepository: UserRepository,
    accessTokenRepository: AccessTokenRepository,
    deviceRepository: DeviceRepository,
    otpService: OtpService,
    email: string,
    password: string,
    confirmPassword: string,
    invitationToken: string,
    otp: UserOtp,
    userAgent: string,
): Promise<void> {
    const authService = new AuthService();
    // sign up the user
    await authService.basicSignUp(
        new UserEmail(email),
        new UserPassword(password),
        new UserPassword(confirmPassword),
        userRepository,
        invitationToken,
    );
    // login the user
    await authService.basicLogin(
        new UserEmail(email),
        new UserPassword(password),
        userRepository,
        accessTokenRepository,
        deviceRepository,
        otpService,
        otp,
        userAgent,
    );
}
