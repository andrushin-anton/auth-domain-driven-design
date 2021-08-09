import { BadArgumentError } from '@common/errors/bad-argument-error';
import { UserPassword } from '@domain/user/user-password';
import { UserRepository } from '@domain/user/user-repository';
import { UserId } from '@domain/user/user-id';

export async function updateUserPassword(
    userRepository: UserRepository,
    userId: string,
    newPasswordString: string,
    newPasswordConfirmString: string,
    oldPasswordString: string,
): Promise<void> {
    const user = await userRepository.findById(new UserId(userId));
    const oldPassword = new UserPassword(oldPasswordString);
    if (!(oldPassword.userPasswordMatch(user))) {
        throw new BadArgumentError('Wrong old password');
    }
    const newPassword = new UserPassword(newPasswordString);
    const newPasswordConfirm = new UserPassword(newPasswordConfirmString);
    if (!newPassword.equals(newPasswordConfirm)) {
        throw new BadArgumentError('Passwords do not match');
    }
    // update the password to the new one!
    user.setPassword(newPassword.getValue());
    return userRepository.save(user);
}
