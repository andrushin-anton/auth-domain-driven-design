import { InvitationToken } from '@domain/access-token/invitation-token';
import { PublisherRepository } from '@domain/event/publisher-repository';
import { UserEmail } from '@domain/user/user-email';
import { UserRepository } from '@domain/user/user-repository';

export async function sendInvitationToken(
    email: string,
    userRepository: UserRepository,
    publisher: PublisherRepository,
): Promise<void> {
    const userEmail = new UserEmail(email);
    const user = await userRepository.findByEmail(userEmail);
    // generate a new invitation token
    const invitationToken = new InvitationToken(user.getId());
    // send it to the event bus
    const event: { message: string; } = {
        message: `Your invitation token is: ${invitationToken.getJWT()}`,
    };
    publisher.publish('user.invitation_token.created', event);
}
