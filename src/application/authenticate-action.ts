import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { User } from '@domain/user/user';
import { UserRepository } from '@domain/user/user-repository';
import { AuthService } from '@domain/auth/auth-service';

export async function authenticateAction(
    userRepository: UserRepository,
    accessTokenRepository: AccessTokenRepository,
): Promise<User> {
    const authService = new AuthService();
    return authService.authenticate(
        userRepository,
        accessTokenRepository,
    );
}
