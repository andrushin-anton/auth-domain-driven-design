import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { PasswordResetToken } from '@domain/access-token/password-reset-token';
import { UserRepository } from '@domain/user/user-repository';

export async function requestPasswordResetValidateAction(
    userRepository: UserRepository,
    accessTokenRepository: AccessTokenRepository,
    passResetTokenJWT: string,
): Promise<void> {
    const passwordResetToken = PasswordResetToken.verifyMe(passResetTokenJWT);
    // find the user by id from the provided token
    await userRepository.findById(passwordResetToken.getId());
    // everything is good, save the token to the AccessTokenRepository
    accessTokenRepository.save(passwordResetToken);
}
