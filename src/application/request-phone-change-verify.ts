import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { AccessTokenTypes } from '@domain/access-token/access-token-name';
import { UserRepository } from '@domain/user/user-repository';
import { UserOtp } from '@domain/user/user-otp';
import { UserPhone } from '@domain/user/user-phone';
import { OtpInvalidError } from '@common/errors/otp-invalid-error';

export async function requestPhoneChangeVerify(
    userRepository: UserRepository,
    accessTokenRepository: AccessTokenRepository,
    userOtp: UserOtp,
): Promise<void> {
    // read the TOKEN_VERIFY_CODE (expires in 5 minutes)
    const tokenVerifyCode = accessTokenRepository.read(AccessTokenTypes.TOKEN_VERIFY_CODE);
    const user = await userRepository.findById(tokenVerifyCode.getId());
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
        throw new Error('UserPhone not found in verify token');
    }
    const { num } = tokenData;
    user.setPhone(new UserPhone(num));
    user.flushLoginAttempts();
    await userRepository.save(user);
}
