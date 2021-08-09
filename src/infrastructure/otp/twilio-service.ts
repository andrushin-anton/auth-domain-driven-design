import { OTPMessage } from '@domain/otp/otp-message';
import { OtpService } from '@domain/otp/otp-service';

export class TwilioService implements OtpService {
    public async sendMessage(otpMessage: OTPMessage): Promise<boolean> {
        /* eslint-disable */
        const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
        try {
            await client.messages.create({
                body: otpMessage.getBody(),
                from: process.env.SMS_NUMBER,
                to: otpMessage.getTo(),
            });
            return true;
        } catch(e) {
            console.log(e);
            return false;
        }
        /* eslint-enable */
    }
}
