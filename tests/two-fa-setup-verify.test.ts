import { twoFaSetup } from "../src/application/two-fa-setup-action";
import { UserId } from '../src/domain/user/user-id';
import { UserOtp } from '../src/domain/user/user-otp';
import { TestService } from "../src/infrastructure/otp/test-service";
import { InMemoryUserRepository } from "../src/infrastructure/user/in-memory-user-repository";
import { InMemoryDeviceRepository } from "../src/infrastructure/device/in-memory-device-repository";
import { authenticateAction } from "../src/application/authenticate-action";
import { twoFaVerifySetup } from "../src/application/two-fa-setup-verify-action";
import { InMemoryAccessTokenRepository } from "../src/infrastructure/access-token/in-memory-access-token-repository";
import { TwoFaSetupToken } from "../src/domain/access-token/twofa-setup-token";
import { VerifyCodeToken } from "../src/domain/access-token/verify-code-token";
import { OtpInvalidError } from "../src/common/errors/otp-invalid-error";
import { UserLockedError } from "../src/common/errors/user-locked-error";

describe('Testing 2FA verify setup functionality', () => {
    test('Should successfully submit the verification code', async () => {
        // test user mike@gmail.com
        const userId = new UserId('8888888-ee79-4b1a-adae-795c856539b3');
        const tokenSetup = new TwoFaSetupToken(userId);
        const mockRequest = { s2fa: tokenSetup.getJWT() };
        const mockResponse = {};
        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        
        const phone = '123456789';
        const userRepository = new InMemoryUserRepository();
        // check the test user does not have any OTP yet
        const user = await userRepository.findById(userId);
        expect(user.getOtp()).toEqual(undefined);
        const otpString = '123456'; 
        // call the setup action
        await twoFaSetup(
            userRepository,
            inMemoryAccessTokenRepository,
            new TestService(), // otp service that simulates sending SMS
            phone,
            new UserOtp(otpString)
        );
        // check the request now has the verify code cookie set as a JWT
        const verifyExists = (inMemoryAccessTokenRepository.getResponse()['v2fa']) ? true : false;
        expect(verifyExists).toEqual(true);
        // the verify code token now should have phone number in it
        const verifyToken = VerifyCodeToken.verifyMe(inMemoryAccessTokenRepository.getResponse()['v2fa']);
        expect(verifyToken.getId().getValue()).toEqual(userId.getValue());
        const tokenData = verifyToken.getData(); 
        expect(tokenData?.num).toEqual(phone);

        // untill now it was 2FA setup
        // the code verification process goes further
        await twoFaVerifySetup(
            userRepository,
            inMemoryAccessTokenRepository,
            new InMemoryDeviceRepository(),
            new UserOtp(otpString),
            'OS:Mac, Browser:Firefox'
        );
        // the phone number is saved with the user
        expect(user.getPhone()?.getValue() === phone);
        // check the request now has the auth cookie set as a JWT
        const authExists = (inMemoryAccessTokenRepository.getResponse()['auth']) ? true : false;
        expect(authExists).toEqual(true);
        // device token should exists
        const deviceExists = (inMemoryAccessTokenRepository.getResponse()['device']) ? true : false;
        expect(deviceExists).toEqual(true);

        // now the authenticate action can be tested
        const authUser = await authenticateAction(userRepository, inMemoryAccessTokenRepository);
        expect(authUser.jsonSerialize()).toEqual({
            "id": "8888888-ee79-4b1a-adae-795c856539b3",
            "name": "Mike M",
            "email": "mike@gmail.com"
        });
    });

    test('Should fail with OtpInvalidError when provided code does not match', async () => {
        // test user mike@gmail.com
        const userId = new UserId('8888888-ee79-4b1a-adae-795c856539b3');
        const tokenSetup = new TwoFaSetupToken(userId);
        const mockRequest = { s2fa: tokenSetup.getJWT() };
        const mockResponse = {};
        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        
        const phone = '123456789';
        const userRepository = new InMemoryUserRepository();
        // check the test user does not have any OTP yet
        const user = await userRepository.findById(userId);
        expect(user.getOtp()).toEqual(undefined);
        // call the setup action
        await twoFaSetup(
            userRepository,
            inMemoryAccessTokenRepository,
            new TestService(), // otp service that simulates sending SMS
            phone,
            new UserOtp('123!!!!!')
        );
        // check the request now has the verify code cookie set as a JWT
        const verifyExists = (inMemoryAccessTokenRepository.getResponse()['v2fa']) ? true : false;
        expect(verifyExists).toEqual(true);
        // the verify code token now should have phone number in it
        const verifyToken = VerifyCodeToken.verifyMe(inMemoryAccessTokenRepository.getResponse()['v2fa']);
        expect(verifyToken.getId().getValue()).toEqual(userId.getValue());
        const tokenData = verifyToken.getData();
        expect(tokenData?.num).toEqual(phone);

        // untill now it was 2FA setup
        // the code verification process goes further
        try {
            const invalidCode = '1234567';
            await twoFaVerifySetup(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new UserOtp(invalidCode),
                'OS:Mac, Browser:Firefox'
            );
        } catch(e) {
            const isBadRequest = (e instanceof OtpInvalidError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(401).toEqual(e.statusCode);
        }
    });

    test('Should fail with UserLockedError when user has more than 5 fasle attempts', async () => {
        // test user mike@gmail.com
        const userId = new UserId('8888888-ee79-4b1a-adae-795c856539b3');
        const tokenSetup = new TwoFaSetupToken(userId);
        const mockRequest = { s2fa: tokenSetup.getJWT() };
        const mockResponse = {};
        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        
        const phone = '123456789';
        const userRepository = new InMemoryUserRepository();
        // call the setup action
        await twoFaSetup(
            userRepository,
            inMemoryAccessTokenRepository,
            new TestService(), // otp service that simulates sending SMS
            phone,
            new UserOtp('123!!!!!')
        );
        // let's simulate the user tried to provide an invalid code 5 times
        // the code verification process goes further
        // once
        try {
            const invalidCode = '1234567';
            await twoFaVerifySetup(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new UserOtp(invalidCode),
                'OS:Mac, Browser:Firefox'
            );
        } catch(e) {
            const isBadRequest = (e instanceof OtpInvalidError) ? true : false;
            expect(true).toEqual(isBadRequest);
        }
        // twice
        try {
            const invalidCode = '1234567';
            await twoFaVerifySetup(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new UserOtp(invalidCode),
                'OS:Mac, Browser:Firefox'
            );
        } catch(e) {
            const isBadRequest = (e instanceof OtpInvalidError) ? true : false;
            expect(true).toEqual(isBadRequest);
        }
        // three
        try {
            const invalidCode = '1234567';
            await twoFaVerifySetup(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new UserOtp(invalidCode),
                'OS:Mac, Browser:Firefox'
            );
        } catch(e) {
            const isBadRequest = (e instanceof OtpInvalidError) ? true : false;
            expect(true).toEqual(isBadRequest);
        }
        // four
        try {
            const invalidCode = '1234567';
            await twoFaVerifySetup(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new UserOtp(invalidCode),
                'OS:Mac, Browser:Firefox'
            );
        } catch(e) {
            const isBadRequest = (e instanceof OtpInvalidError) ? true : false;
            expect(true).toEqual(isBadRequest);
        }
        // five
        try {
            const invalidCode = '1234567';
            await twoFaVerifySetup(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new UserOtp(invalidCode),
                'OS:Mac, Browser:Firefox'
            );
        } catch(e) {
            const isBadRequest = (e instanceof OtpInvalidError) ? true : false;
            expect(true).toEqual(isBadRequest);
        }
        // six
        try {
            const invalidCode = '1234567';
            await twoFaVerifySetup(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new UserOtp(invalidCode),
                'OS:Mac, Browser:Firefox'
            );
        } catch(e) {
            // here we go, it now should return UserLockedError
            const isBadRequest = (e instanceof UserLockedError) ? true : false;
            expect(true).toEqual(isBadRequest);
        }
    });
});