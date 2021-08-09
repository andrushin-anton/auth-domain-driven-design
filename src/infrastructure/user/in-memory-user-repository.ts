import { User } from '@domain/user/user';
import { UserEmail } from '@domain/user/user-email';
import { UserId } from '@domain/user/user-id';
import { UserName } from '@domain/user/user-name';
import { UserPassword } from '@domain/user/user-password';
import { UserPhone } from '@domain/user/user-phone';
import { UserRepository } from '@domain/user/user-repository';
import { UserSettings } from '@domain/user/user-settings';
import { UserNotFoundError } from '@common/errors/user-not-found-error';

export class InMemoryUserRepository implements UserRepository {
    private users: Array<User> = [
        new User(
            new UserId('6b4fa55d-ee79-4b1a-adae-795c856539b3'),
            new UserName('John P'),
            new UserEmail('john@gmail.com'),
            new UserPassword('123456789Abc').getValue(),
            new UserPhone('79622681813'),
        ),
        new User(
            new UserId('8888888-ee79-4b1a-adae-795c856539b3'),
            new UserName('Mike M'),
            new UserEmail('mike@gmail.com'),
            new UserPassword('Abc123456789').getValue(),
        ),
        new User(
            new UserId('locked-ee79-4b1a-adae-795c856539b3'),
            new UserName('Locked L'),
            new UserEmail('locked@gmail.com'),
            new UserPassword('Abc123456789').getValue(),
            undefined,
            undefined,
            1,
            true,
        ),
    ];

    public async findById(userId: UserId): Promise<User> {
        let foundUserObject = new User(new UserId(), new UserName('Guest'), new UserEmail('guest@email.com'));
        let foundUser = false;
        this.users.forEach((el) => {
            if (userId.equals(el.getId())) {
                foundUser = true;
                foundUserObject = el;
            }
        });
        if (!foundUser) {
            throw new UserNotFoundError();
        }
        return new Promise((resolve) => {
            resolve(foundUserObject);
        });
    }

    public async findByEmail(email: UserEmail): Promise<User> {
        let userExists = false;
        // create an empty user object
        let foundUser: User = new User(new UserId(), new UserName('Guest'), new UserEmail('guest@email.com'));
        this.users.forEach((el) => {
            if (el.getEmail().equals(email)) {
                userExists = true;
                foundUser = el;
            }
        });
        if (!userExists) {
            throw new UserNotFoundError();
        }
        return new Promise((resolve) => {
            resolve(foundUser);
        });
    }

    public async findUserSettings(userId: UserId): Promise<UserSettings> {
        const user = await this.findById(userId);
        const userSettings = new UserSettings(
            userId,
            user.getName(),
            user.getEmail(),
            user.getPhone(),
        );
        return userSettings;
    }

    public async save(user: User): Promise<void> {
        let foundUser = false;
        this.users.forEach((el, index) => {
            if (user.getId().equals(el.getId())) {
                foundUser = true;
                // need to update it
                this.users[index] = user;
            }
        });
        if (!foundUser) {
            // need to save it
            this.users.push(user);
        }
        return new Promise((resolve) => {
            resolve();
        });
    }
}
