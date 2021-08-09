import { BadArgumentError } from "../src/common/errors/bad-argument-error";
import { loginAction } from "../src/application/login-action"
import { InMemoryUserRepository } from "../src/infrastructure/user/in-memory-user-repository";
import { UserNotFoundError } from "../src/common/errors/user-not-found-error";
import { InMemoryDeviceRepository } from "../src/infrastructure/device/in-memory-device-repository";
import { DeviceId } from "../src/domain/device/device-id";
import { TestService } from "../src/infrastructure/otp/test-service";
import { UserOtp } from "../src/domain/user/user-otp";
import { UserEmail } from '../src/domain/user/user-email';
import { InMemoryAccessTokenRepository } from "../src/infrastructure/access-token/in-memory-access-token-repository";
import { DeviceToken } from "../src/domain/access-token/device-token";
import { BadRequestError } from "../src/common/errors/bad-request-error";
import { RequiredDeviceVerificationError } from "../src/common/errors/required-device-verification-error";
import { Required2FASetupError } from "../src/common/errors/required-2fa-setup-error";
import { UserLockedError } from "../src/common/errors/user-locked-error";

describe('Should login functionality because test user has phone number and valid device cookie', () => {
    test('Should successfully login the test user', async () => {
        // device with id 123-123-123 belongs to the test user john@gmail.com in InMemoryDeviceRepository
        const deviceAccessToken = new DeviceToken(new DeviceId('123-123-123'));
        // request that contains a valid device token
        const mockRequest = {
            device: deviceAccessToken.getJWT()
        };
        const mockResponse = {};
        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        
        const email = 'john@gmail.com';
        const password = '123456789Abc';
        await loginAction(
            new InMemoryUserRepository(),
            inMemoryAccessTokenRepository,
            new InMemoryDeviceRepository(),
            new TestService(),
            email,
            password,
            new UserOtp(),
            'OS:Mac, Browser:Firefox'
        );
        // check the request now has the auth cookie set as a JWT
        const authExists = (inMemoryAccessTokenRepository.getResponse()['auth']) ? true : false;
        expect(authExists).toEqual(true);
    });
    
    test('Should fail with 400 when email or password is missing', async () => {
        try {
            const mockRequest = {};
            const mockResponse = {};
            const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
                mockRequest,
                mockResponse
            );
            
            const email = '';
            const password = 'pass';
            await loginAction(
                new InMemoryUserRepository(),
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof BadRequestError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(400).toEqual(e.statusCode);
        }
    });

    test('Should fail with Bad Request(400) when email is invalid', async () => {
        try {
            const mockRequest = {};
            const mockResponse = {};
            const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
                mockRequest,
                mockResponse
            );
            
            const email = 'blahhhhh';
            const password = 'pass';
            await loginAction(
                new InMemoryUserRepository(),
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof BadRequestError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(400).toEqual(e.statusCode);
            expect("Email is invalid").toEqual(e.message);
        }
    });

    test('Should fail with Bad Request(400) when password is invalid', async () => {
        try {
            const mockRequest = {};
            const mockResponse = {};
            const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
                mockRequest,
                mockResponse
            );
            const email = 'john@gmail.com';
            const password = 'password';
            await loginAction(
                new InMemoryUserRepository(),
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof BadArgumentError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(400).toEqual(e.statusCode);
            expect("Password must contain at least one upper case letter, one lower case letter and one number").toEqual(e.message);
        }
    });

    test('Should fail with Not Found(404) when user not found', async () => {
        try {
            const mockRequest = {};
            const mockResponse = {};
            const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
                mockRequest,
                mockResponse
            );
            
            const email = 'none@gmail.com';
            const password = '123456789Abc';
            await loginAction(
                new InMemoryUserRepository(),
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof UserNotFoundError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(404).toEqual(e.statusCode);
            expect("User Not Found").toEqual(e.message);
        }
    });

    test('Should fail with RequiredDeviceVerificationError(401) when user has not device token or token expired', async () => {
        const mockRequest = {};
        const mockResponse = {};
        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        // valid user credentials (John has his phone number saved in the db)
        const email = 'john@gmail.com';
        const password = '123456789Abc';
        const userRepository = new InMemoryUserRepository();

        try {
            await loginAction(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof RequiredDeviceVerificationError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(401).toEqual(e.statusCode);
            // it should have verify code token in cookies 
            const verifyExists = (inMemoryAccessTokenRepository.getResponse()['v2fa']) ? true : false;
            expect(verifyExists).toEqual(true);
            // the user shold have OTP saved with him
            const user = await userRepository.findByEmail(new UserEmail(email));
            expect(user.getOtp()).toBeDefined();
        }
    });

    test('Should fail with Required2FASetupError(401) when there is no phone number saved for this user', async () => {
        try {
            const mockRequest = {};
            const mockResponse = {};
            const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
                mockRequest,
                mockResponse
            );
            // valid user credentials (Mike has not provided his phone number yet)
            const email = 'mike@gmail.com';
            const password = 'Abc123456789';
            await loginAction(
                new InMemoryUserRepository(),
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof Required2FASetupError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(401).toEqual(e.statusCode);
        }
    });

    test('Should fail with UserLockedError(401) when the user is locked', async () => {
        try {
            const mockRequest = {};
            const mockResponse = {};
            const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
                mockRequest,
                mockResponse
            );
            
            // valid user credentials (Locked user is locked in the db)
            const email = 'locked@gmail.com';
            const password = 'Abc123456789';
            await loginAction(
                new InMemoryUserRepository(),
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof UserLockedError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(401).toEqual(e.statusCode);
        }
    });

    test('Should fail with UserLockedError(401) when the user is trying with wrong password more than 5 times', async () => {
        const mockRequest = {};
        const mockResponse = {};
        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        
        // invalid password
        const email = 'john@gmail.com';
        const password = 'invalidAbc123456789';
        const userRepository = new InMemoryUserRepository();
        // once
        try {
            await loginAction(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof BadArgumentError) ? true : false;
            expect(true).toEqual(isBadRequest);
        }
        // twice
        try {
            await loginAction(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof BadArgumentError) ? true : false;
            expect(true).toEqual(isBadRequest);
        }
        // three
        try {
            await loginAction(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof BadArgumentError) ? true : false;
            expect(true).toEqual(isBadRequest);
        }
        // four
        try {
            await loginAction(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof BadArgumentError) ? true : false;
            expect(true).toEqual(isBadRequest);
        }
        // five
        try {
            await loginAction(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            const isBadRequest = (e instanceof BadArgumentError) ? true : false;
            expect(true).toEqual(isBadRequest);
        }
        // six
        try {
            await loginAction(
                userRepository,
                inMemoryAccessTokenRepository,
                new InMemoryDeviceRepository(),
                new TestService(),
                email,
                password,
                new UserOtp(),
                'OS:Mac, Browser:Firefox'
            );
            // this should not be called!
            expect(1).toEqual(2);
        } catch(e) {
            // here we go!
            const isBadRequest = (e instanceof UserLockedError) ? true : false;
            expect(true).toEqual(isBadRequest);
        }
    });
})