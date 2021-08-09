import { InMemoryUserRepository } from "../src/infrastructure/user/in-memory-user-repository";
import { updateUserPassword } from "../src/application/update-user-password-action";
import { DeviceId } from "../src/domain/device/device-id";
import { loginAction } from "../src/application/login-action";
import { InMemoryDeviceRepository } from "../src/infrastructure/device/in-memory-device-repository";
import { TestService } from "../src/infrastructure/otp/test-service";
import { UserOtp } from "../src/domain/user/user-otp";
import { authenticateAction } from "../src/application/authenticate-action";
import { InMemoryAccessTokenRepository } from "../src/infrastructure/access-token/in-memory-access-token-repository";
import { DeviceToken } from "../src/domain/access-token/device-token";
import { BadArgumentError } from "../src/common/errors/bad-argument-error";
import { UserNotFoundError } from "../src/common/errors/user-not-found-error";

describe('Testing updating user password functionality', () => {
    test('Should successfully change the user password', async () => {
        // the user exists
        const userId = '6b4fa55d-ee79-4b1a-adae-795c856539b3';
        const email = 'john@gmail.com';
        const newPassword = 'Abc1234567';
        const newPasswordConfirm = 'Abc1234567';
        const oldPassword = '123456789Abc';
        const userRepository = new InMemoryUserRepository();

        await updateUserPassword(
            userRepository,
            userId,
            newPassword,
            newPasswordConfirm,
            oldPassword
        );
        // should now login with the new password
        // device with id 123-123-123 belongs to the test user john@gmail.com in InMemoryDeviceRepository
        const deviceAccessToken = new DeviceToken(new DeviceId('123-123-123'));
        // first need to login to let the service create a valid JWT
        // and put it into cookie
        const mockRequest = {
            device: deviceAccessToken.getJWT()
        };
        const mockResponse = {};
        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        
        await loginAction(
            userRepository,
            inMemoryAccessTokenRepository,
            new InMemoryDeviceRepository(),
            new TestService(),
            email,
            newPassword,
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

    test('Should fail with wrong old password when the old password is not right', async () => {
        // the user exists
        const userId = '6b4fa55d-ee79-4b1a-adae-795c856539b3';
        const newPassword = 'Abc1234567';
        const newPasswordConfirm = 'Abc1234567';
        const oldPassword = '123456789AbcWRONG';
        const userRepository = new InMemoryUserRepository();

        try {
            await updateUserPassword(
                userRepository,
                userId,
                newPassword,
                newPasswordConfirm,
                oldPassword
            );
        } catch (err) {
            const isBadRequest = (err instanceof BadArgumentError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(err.statusCode).toEqual(400);
            expect(err.message).toEqual('Wrong old password');
        }
    });

    test('Should fail with passwords do not match when the new and confirm passwords are not equal', async () => {
        // the user exists
        const userId = '6b4fa55d-ee79-4b1a-adae-795c856539b3';
        const newPassword = 'Abc1234567DIFFEENT';
        const newPasswordConfirm = 'Abc1234567';
        const oldPassword = '123456789Abc';
        const userRepository = new InMemoryUserRepository();

        try {
            await updateUserPassword(
                userRepository,
                userId,
                newPassword,
                newPasswordConfirm,
                oldPassword
            );
        } catch (err) {
            const isBadRequest = (err instanceof BadArgumentError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(err.statusCode).toEqual(400);
            expect(err.message).toEqual('Passwords do not match');
        }
    });

    test('Should fail with User Not Found when the unknown userId is provided', async () => {
        // the user exists
        const userId = '6b4fa55d-ee79-4b1a-adae-795c856539b3UNKNOWN';
        const newPassword = 'Abc1234567';
        const newPasswordConfirm = 'Abc1234567';
        const oldPassword = '123456789Abc';
        const userRepository = new InMemoryUserRepository();

        try {
            await updateUserPassword(
                userRepository,
                userId,
                newPassword,
                newPasswordConfirm,
                oldPassword
            );
        } catch (err) {
            const isBadRequest = (err instanceof UserNotFoundError) ? true : false;
            expect(true).toEqual(isBadRequest);
            expect(err.statusCode).toEqual(404);
            expect(err.message).toEqual('User Not Found');
        }
    });
})