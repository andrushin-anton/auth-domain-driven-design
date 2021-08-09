import { UserId } from '@domain/user/user-id';
import { UserRepository } from '@domain/user/user-repository';
import { UserSettings } from '@domain/user/user-settings';

export async function getUserSettingsAction(
    userRepository: UserRepository,
    userId: string,
): Promise<UserSettings> {
    return userRepository.findUserSettings(new UserId(userId));
}
