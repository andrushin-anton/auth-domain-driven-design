import { AccessToken } from './access-token';
import { AccessTokenTypes } from './access-token-name';

export interface AccessTokenRepository {
    save(accessToken: AccessToken): void;
    delete(tokenName: string): void;
    read(accessTokenType: AccessTokenTypes): AccessToken;
}
