import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { VerifyCodeToken } from '@domain/access-token/verify-code-token';
import { UserRepository } from '@domain/user/user-repository';
import { UserPhone } from '@domain/user/user-phone';
import { UserId } from '@domain/user/user-id';
import { UserOtp } from '@domain/user/user-otp';
import { OtpService } from '@domain/otp/otp-service';
import { OTPMessage } from '@domain/otp/otp-message';

export async function requestPhoneChange(
    userRepository: UserRepository,
    accessTokenRepository: AccessTokenRepository,
    otpService: OtpService,
    phoneNumber: UserPhone,
    userId: UserId,
    otp: UserOtp,
): Promise<void> {
    // read the user
    const user = await userRepository.findById(userId);
    const otpMessage = new OTPMessage(phoneNumber, otp.getOtp());
    // save the encrypted otp with the user
    user.setOtp(otp.getValue());
    await userRepository.save(user);
    // send a message to the provided number with OTP
    await otpService.sendMessage(otpMessage);
    // create TOKEN_VERIFY_CODE with userID and phone number (expires in 5 miutes)
    const verifyCodeToken = new VerifyCodeToken(
        user.getId(),
        { num: phoneNumber.getValue() },
    );
    accessTokenRepository.save(verifyCodeToken);
}
