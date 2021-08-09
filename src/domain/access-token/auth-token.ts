import { UserId } from '@domain/user/user-id';
import { EntityId } from '@domain/basic/value-object/entity-id';
import { AccessTokenSecret } from './access-token-secret';
import { AccessToken } from './access-token';
import { AccessTokenName, AccessTokenTypes } from './access-token-name';

const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET ?? '';

export class AuthToken extends AccessToken {
    public constructor(uid: EntityId) {
        super(
            uid,
            new AccessTokenName(AccessTokenTypes.TOKEN_AUTH),
            new AccessTokenSecret(AUTH_TOKEN_SECRET),
            'icuc.social',
        );
    }

    public static verifyMe(jwtToVerify: string): AuthToken {
        // auth token lifetime is 1 day
        const authTokenLifeTime = 86400; // seconds
        const { id } = super.verify(
            jwtToVerify,
            new AccessTokenSecret(AUTH_TOKEN_SECRET),
            authTokenLifeTime,
        );
        return new AuthToken(new UserId(id));
    }
}
