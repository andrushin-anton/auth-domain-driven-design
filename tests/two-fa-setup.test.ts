import { twoFaSetup } from "../src/application/two-fa-setup-action";
import { UserId } from '../src/domain/user/user-id';
import { UserOtp } from '../src/domain/user/user-otp';
import { TestService } from "../src/infrastructure/otp/test-service";
import { InMemoryUserRepository } from "../src/infrastructure/user/in-memory-user-repository";
import { InMemoryAccessTokenRepository } from "../src/infrastructure/access-token/in-memory-access-token-repository";
import { TwoFaSetupToken } from "../src/domain/access-token/twofa-setup-token";
import { VerifyCodeToken } from "../src/domain/access-token/verify-code-token";
import { BadRequestError } from "../src/common/errors/bad-request-error";
import { CookieNotFoundError } from "../src/common/errors/cookie-not-found-error";

describe('Testing 2FA setup functionality', () => {
    test('Should successfully submit the phone number', async () => {
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
            new UserOtp('othercode')
        );
        // check the request now has the verify code cookie set as a JWT
        const verifyExists = (inMemoryAccessTokenRepository.getResponse()['v2fa']) ? true : false;
        expect(verifyExists).toEqual(true);
        // the verify code token now should have phone number in it
        const verifyToken = VerifyCodeToken.verifyMe(inMemoryAccessTokenRepository.getResponse()['v2fa']);
        expect(verifyToken.getId().getValue()).toEqual(userId.getValue());
        const tokenData = verifyToken.getData();
        expect(tokenData?.num).toEqual(phone);
    });

    test('Should fail with BadRequestError when phone number is invalid', async () => {
        // test user mike@gmail.com
        const userId = new UserId('8888888-ee79-4b1a-adae-795c856539b3');
        const mockRequest = {};
        const mockResponse = {};
        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        
        const phone = '12345567788345345';
        const userRepository = new InMemoryUserRepository();
        // check the test user does not have any OTP yet
        const user = await userRepository.findById(userId);
        expect(user.getOtp()).toEqual(undefined);
        // call the setup action
        try {
            await twoFaSetup(
                userRepository,
                inMemoryAccessTokenRepository,
                new TestService(), // otp service that simulates sending SMS
                phone,
                new UserOtp('othercode')
            );
        } catch(e) {
            const isBadRequest = (e instanceof BadRequestError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(400).toEqual(e.statusCode);
        }
    });

    test('Should fail with CookieNotFoundError when v2fa token not provided', async () => {
        // test user mike@gmail.com
        const userId = new UserId('8888888-ee79-4b1a-adae-795c856539b3');
        const mockRequest = {};
        const mockResponse = {};
        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        
        const phone = '1234556789';
        const userRepository = new InMemoryUserRepository();
        // check the test user does not have any OTP yet
        const user = await userRepository.findById(userId);
        expect(user.getOtp()).toEqual(undefined);
        // call the setup action
        try {
            await twoFaSetup(
                userRepository,
                inMemoryAccessTokenRepository,
                new TestService(), // otp service that simulates sending SMS
                phone,
                new UserOtp('othercode')
            );
        } catch(e) {
            const isBadRequest = (e instanceof CookieNotFoundError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(400).toEqual(e.statusCode);
        }
    });
});