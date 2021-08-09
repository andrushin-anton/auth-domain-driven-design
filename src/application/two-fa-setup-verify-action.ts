import { UserLockedError } from '@common/errors/user-locked-error';
import { OtpInvalidError } from '@common/errors/otp-invalid-error';
import { UserRepository } from '@domain/user/user-repository';
import { UserOtp } from '@domain/user/user-otp';
import { UserPhone } from '@domain/user/user-phone';
import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { AccessTokenTypes } from '@domain/access-token/access-token-name';
import { AuthToken } from '@domain/access-token/auth-token';
import { DeviceRepository } from '@domain/device/device-repository';
import { DeviceService } from '@domain/device/device-service';

export async function twoFaVerifySetup(
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
    // save the phone number with user
    const tokenData = tokenVerifyCode.getData();
    if (tokenData === undefined || tokenData.num === undefined) {
        throw new Error('UserPhone not found in the verify token');
    }
    const { num } = tokenData;
    user.setPhone(new UserPhone(num));
    user.flushLoginAttempts();
    await userRepository.save(user);
    // activate device, it will also create a device token which will expire after 30 days.
    const deviceService = new DeviceService(
        accessTokenRepository,
        deviceRepository,
        userAgent,
    );
    await deviceService.activateDevice(user);
    // issue TOKEN_AUTH
    const authToken = new AuthToken(user.getId());
    // save it to access token store (ex. cookies)
    accessTokenRepository.save(authToken);
}
