import { InMemoryUserRepository } from "../src/infrastructure/user/in-memory-user-repository";
import { getUserSettingsAction } from "../src/application/settings-action";
import { UserNotFoundError } from "../src/common/errors/user-not-found-error";

describe('Testing settings functionality', () => {
    test('Should successfully get the user settings', async () => {
        // the user exists
        const userId = '6b4fa55d-ee79-4b1a-adae-795c856539b3';
        const userSettings = await getUserSettingsAction(new InMemoryUserRepository(), userId);
        expect(userSettings.jsonSerialize()).toEqual({
            "id": "6b4fa55d-ee79-4b1a-adae-795c856539b3",
            "name": "John P",
            "email": "john@gmail.com",
            "phone": "79622681813"
        });
    });

    test('Should respond with Not authorized(401) when user is not loged in', async () => {
        try {
            const userId = 'not_known_user_id';
            await getUserSettingsAction(new InMemoryUserRepository(), userId);            
        } catch (err) {
            const isNotFoundError = (err instanceof UserNotFoundError) ? true : false;
            expect(true).toEqual(isNotFoundError);
            expect(err.statusCode).toEqual(404);
            expect(err.message).toEqual('User Not Found');
        }
    });
})