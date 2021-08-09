import { User } from './user';
import { UserEmail } from './user-email';
import { UserId } from './user-id';
import { UserSettings } from './user-settings';

export interface UserRepository {
    findById(userId: UserId): Promise<User>;
    findByEmail(email: UserEmail): Promise<User>;
    findUserSettings(userId: UserId): Promise<UserSettings>;
    save(user: User): Promise<void>;
}
