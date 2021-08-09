import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { AccessTokenTypes } from '@domain/access-token/access-token-name';

export function logoutAction(accessTokenRepository: AccessTokenRepository): void {
    return accessTokenRepository.delete(AccessTokenTypes.TOKEN_AUTH);
}
