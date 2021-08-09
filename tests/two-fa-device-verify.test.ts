import { TestService } from "../src/infrastructure/otp/test-service";
import { InMemoryUserRepository } from "../src/infrastructure/user/in-memory-user-repository";
import { InMemoryDeviceRepository } from "../src/infrastructure/device/in-memory-device-repository";
import { loginAction } from "../src/application/login-action";
import { UserEmail } from '../src/domain/user/user-email';
import { UserOtp } from '../src/domain/user/user-otp';
import { twoFaVerifyDevice } from "../src/application/two-fa-device-verify-action";
import { InMemoryAccessTokenRepository } from "../src/infrastructure/access-token/in-memory-access-token-repository";
import { DeviceToken } from "../src/domain/access-token/device-token";
import { RequiredDeviceVerificationError } from "../src/common/errors/required-device-verification-error";

describe('Testing 2FA device verification', () => {
    test('Should fail with RequiredDeviceVerificationError(401) when user has not device token or token expired', async () => {
        const mockRequest = {};
        const mockResponse = {};
        const accessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        // valid user credentials (John has his phone number saved in the db)
        const email = 'john@gmail.com';
        const password = '123456789Abc';
        const userRepository = new InMemoryUserRepository();
        const deviceRepository = new InMemoryDeviceRepository();

        try {
            await loginAction(
                userRepository,
                accessTokenRepository,
                deviceRepository,
                new TestService(),
                email,
                password,
                new UserOtp('1234567'),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof RequiredDeviceVerificationError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(401).toEqual(e.statusCode);
            // it should have verify code token in cookies 
            const verifyExists = (accessTokenRepository.getResponse()['v2fa']) ? true : false;
            expect(verifyExists).toEqual(true);
            // the user shold have OTP saved with him
            const user = await userRepository.findByEmail(new UserEmail(email));
            expect(user.getOtp()).toBeDefined();

            // call the device verify action
            await twoFaVerifyDevice(
                userRepository,
                accessTokenRepository,
                deviceRepository,
                new UserOtp('1234567'),
                'OS:Mac, Browser:Firefox'
            );
             // check the request now has the auth cookie set as a JWT
            const authExists = (accessTokenRepository.getResponse()['auth']) ? true : false;
            expect(authExists).toEqual(true);
            // device token should exists
            const deviceExists = (accessTokenRepository.getResponse()['device']) ? true : false;
            expect(deviceExists).toEqual(true);
            // check the new device record in the db
            const deviceToken = DeviceToken.verifyMe(accessTokenRepository.getResponse()['device']);
            const deviceInDB = await deviceRepository.findById(deviceToken.getId(), user.getId());
            expect(deviceInDB.getId().getValue()).toEqual(deviceToken.getId().getValue());
            expect(deviceInDB.getTimesActivated()).toEqual(1);
        }
    });
});
