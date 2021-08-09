import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { AccessTokenTypes } from '@domain/access-token/access-token-name';
import { UserRepository } from '@domain/user/user-repository';
import { UserPassword } from '@domain/user/user-password';
import { BadArgumentError } from '@common/errors/bad-argument-error';

export async function resetPasswordAction(
    userRepository: UserRepository,
    accesstokenRepository: AccessTokenRepository,
    newPasswordString: string,
    newPasswordConfirmString: string,
): Promise<void> {
    // read the reset token and the user that it belongs to.
    const resetPasswordToken = accesstokenRepository.read(AccessTokenTypes.TOKEN_PSWD_RESET);
    const user = await userRepository.findById(resetPasswordToken.getId());
    // compare passwords
    const newPassword = new UserPassword(newPasswordString);
    const newPasswordConfirm = new UserPassword(newPasswordConfirmString);
    if (!newPassword.equals(newPasswordConfirm)) {
        throw new BadArgumentError('Passwords do not match');
    }
    // update the password to the new one!
    user.setPassword(newPassword.getValue());
    return userRepository.save(user);
}
