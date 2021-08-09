import { UserLockedError } from '@common/errors/user-locked-error';
import { OtpInvalidError } from '@common/errors/otp-invalid-error';
import { UserRepository } from '@domain/user/user-repository';
import { UserOtp } from '@domain/user/user-otp';
import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { AccessTokenTypes } from '@domain/access-token/access-token-name';
import { AuthToken } from '@domain/access-token/auth-token';
import { DeviceRepository } from '@domain/device/device-repository';
import { DeviceService } from '@domain/device/device-service';

export async function twoFaVerifyDevice(
    userRepository: UserRepository,
    accessTokenRepository: AccessTokenRepository,
    deviceRepository: DeviceRepository,
    userOtp: UserOtp,
    userAgent: string,
): Promise<void> {
    // read the TOKEN_VERIFY_CODE (expires in 5 minutes)
    const tokenVerifyCode = accessTokenRepository.read(AccessTokenTypes.TOKEN_VERIFY_CODE);
    const user = await userRepository.findById(tokenVerifyCode.getId());
    if (user.isLocked()) {
        throw new UserLockedError();
    }
    // verify the code with OTP in user db
    const codesMatch = userOtp.codeMatch(user);
    if (!codesMatch) {
        user.incrementLoginAttempts();
        await userRepository.save(user);
        throw new OtpInvalidError();
    }
    // activate device, it will also create a device token whic will expire after 30 days.
    const deviceService = new DeviceService(
        accessTokenRepository,
        deviceRepository,
        userAgent,
    );
    await deviceService.activateDevice(user);
    // flush login attempts
    user.flushLoginAttempts();
    await userRepository.save(user);
    // issue a new TOKEN_AUTH
    const authToken = new AuthToken(user.getId());
    // save it to access token store (ex. cookies)
    accessTokenRepository.save(authToken);
}
