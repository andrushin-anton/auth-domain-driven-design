import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { UserRepository } from '@domain/user/user-repository';
import { UserOtp } from '@domain/user/user-otp';
import { UserEmail } from '@domain/user/user-email';
import { UserPassword } from '@domain/user/user-password';
import { DeviceRepository } from '@domain/device/device-repository';
import { OtpService } from '@domain/otp/otp-service';
import { AuthService } from '@domain/auth/auth-service';

export async function loginAction(
    userRepository: UserRepository,
    accessTokenRepository: AccessTokenRepository,
    deviceRepository: DeviceRepository,
    otpService: OtpService,
    email: string,
    password: string,
    otp: UserOtp,
    userAgent: string,
): Promise<void> {
    const authService = new AuthService();
    return authService.basicLogin(
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
