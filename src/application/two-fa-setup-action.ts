import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { AccessTokenTypes } from '@domain/access-token/access-token-name';
import { VerifyCodeToken } from '@domain/access-token/verify-code-token';
import { UserRepository } from '@domain/user/user-repository';
import { UserOtp } from '@domain/user/user-otp';
import { UserPhone } from '@domain/user/user-phone';
import { OTPMessage } from '@domain/otp/otp-message';
import { OtpService } from '@domain/otp/otp-service';

export async function twoFaSetup(
    userRepository: UserRepository,
    accessTokenRepository: AccessTokenRepository,
    otpService: OtpService,
    phoneNumber: string,
    otp: UserOtp,
): Promise<void> {
    const userPhone = new UserPhone(phoneNumber);
    // read the TOKEN_2FA_SETUP (expires in 20 minutes)
    const twoFaSetupToken = accessTokenRepository.read(AccessTokenTypes.TOKEN_2FA_SETUP);
    // read the user
    const user = await userRepository.findById(twoFaSetupToken.getId());
    const otpMessage = new OTPMessage(userPhone, otp.getOtp());
    // save the encrypted otp with the user
    user.setOtp(otp.getValue());
    await userRepository.save(user);
    // send a message to the provided number with OTP
    await otpService.sendMessage(otpMessage);
    // create TOKEN_VERIFY_CODE with userID and phone number (expires in 5 miutes)
    const verifyCodeToken = new VerifyCodeToken(user.getId(), { num: userPhone.getValue() });
    accessTokenRepository.save(verifyCodeToken);
}
