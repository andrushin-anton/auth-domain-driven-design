import { loginAction } from '../src/application/login-action';
import { InMemoryUserRepository } from '../src/infrastructure/user/in-memory-user-repository';
import { authenticateAction } from '../src/application/authenticate-action';
import { InMemoryDeviceRepository } from '../src/infrastructure/device/in-memory-device-repository';
import { DeviceId } from '../src/domain/device/device-id';
import { TestService } from '../src/infrastructure/otp/test-service';
import { UserOtp } from '../src/domain/user/user-otp';
import { InMemoryAccessTokenRepository } from '../src/infrastructure/access-token/in-memory-access-token-repository';
import { DeviceToken } from '../src/domain/access-token/device-token';
import { NotAuthorizedError } from '../src/common/errors/not-authorized-error';

describe('Testing authenticate functionality', () => {
    test('Should successfully authenticate the test user', async () => {
        // device with id 123-123-123 belongs to the test user john@gmail.com in InMemoryDeviceRepository
        const deviceAccessToken = new DeviceToken(new DeviceId('123-123-123'));
        // first need to login to let the service create a valid JWT
        // and put it into cookie
        const mockRequest = { device: deviceAccessToken.getJWT() };
        const mockResponse = {};

        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        
        const email = 'john@gmail.com';
        const password = '123456789Abc';
        const userRepository = new InMemoryUserRepository();
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
        // check the request now has the auth cookie set as a JWT
        const authExists = (inMemoryAccessTokenRepository.getResponse()['auth']) ? true : false;
        expect(authExists).toEqual(true);

        // now need to call authenticateAction with mockRequest
        // because it contains a valid auth token
        const user = await authenticateAction(userRepository, inMemoryAccessTokenRepository);
        expect(user.jsonSerialize()).toEqual({
            "id": "6b4fa55d-ee79-4b1a-adae-795c856539b3",
            "name": "John P",
            "email": "john@gmail.com"
        });
    });

    test('Should respond with Not authorized(401) with invalid token', async () => {
        // device with id 123-123-123 belongs to the test user john@gmail.com in InMemoryDeviceRepository
        const deviceAccessToken = new DeviceToken(new DeviceId('123-123-123'));
        const mockRequest = {
            device: deviceAccessToken.getJWT(),
            auth: "!eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZiNGZhNTVkLWVlNzktNGIxYS1hZGFlLTc5NWM4NTY1MzliMyIsIm5hbWUiOiJhdXRoIiwic2VydmVyIjoiaWN1Yy5zb2NpYWwiLCJpYXQiOjE2MDY4MzcxNTR9.IAIED4Yz-UvUrpYxL6sHsPT4UNHT8P9JmQInHBFseac"
        };
        const mockResponse = {};
        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        try {
            await authenticateAction(new InMemoryUserRepository(), inMemoryAccessTokenRepository);            
        } catch (err) {
            const isNotAuthorisedError = (err instanceof NotAuthorizedError) ? true : false;
            expect(true).toEqual(isNotAuthorisedError);
            expect(err.statusCode).toEqual(401);
            expect(err.message).toEqual('Not authorized');
        }
    });

    test('Should respond with Not authorized(401) when token is missing', async () => {
        // device with id 123-123-123 belongs to the test user john@gmail.com in InMemoryDeviceRepository
        const deviceAccessToken = new DeviceToken(new DeviceId('123-123-123'));
        const mockRequest = {
            device: deviceAccessToken.getJWT()
        };
        const mockResponse = {};
        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        try {
            await authenticateAction(new InMemoryUserRepository(), inMemoryAccessTokenRepository);            
        } catch (err) {
            const isNotAuthorisedError = (err instanceof NotAuthorizedError) ? true : false;
            expect(true).toEqual(isNotAuthorisedError);
            expect(err.statusCode).toEqual(401);
            expect(err.message).toEqual('Not authorized');
        }
    });
})