import { PublisherRepository } from '@domain/event/publisher-repository';
import { PasswordResetToken } from '@domain/access-token/password-reset-token';
import { UserRepository } from '@domain/user/user-repository';
import { UserEmail } from '@domain/user/user-email';

export async function requestPasswordResetAction(
    userRepository: UserRepository,
    email: UserEmail,
    pub: PublisherRepository,
    host: string,
): Promise<void> {
    const user = await userRepository.findByEmail(email);
    // generate new reset pass token
    const token = new PasswordResetToken(user.getId());
    const link = `http://${host}/auth/request-password-reset-validate/${token.getJWT()}`;
    // send it to the user
    pub.publish('user.password-change-email.created', {
        to: user.getEmail().getValue(),
        from: 'notifications@icuc.social', // need to put somewhere else
        body: `Click the provided link to reset your password: ${link}`,
    });
}
