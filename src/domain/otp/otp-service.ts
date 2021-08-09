import { OTPMessage } from './otp-message';

export interface OtpService {
    sendMessage(otpMessage: OTPMessage): Promise<boolean>;
}
