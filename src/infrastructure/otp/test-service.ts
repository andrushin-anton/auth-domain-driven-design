import { OTPMessage } from '@domain/otp/otp-message';
import { OtpService } from '@domain/otp/otp-service';

export class TestService implements OtpService {
    public sendMessage(otpMessage: OTPMessage): Promise<boolean> {
        otpMessage.getBody();
        return new Promise((resolve) => resolve(true));
    }
}
