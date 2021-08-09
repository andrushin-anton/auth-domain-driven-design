import { UserId } from '@domain/user/user-id';
import { EntityId } from '@domain/basic/value-object/entity-id';
import { AccessTokenSecret } from './access-token-secret';
import { AccessToken, TokenData } from './access-token';
import { AccessTokenName, AccessTokenTypes } from './access-token-name';

const VERIFY_TOKEN_SECRET = process.env.VERIFY_TOKEN_SECRET ?? '';

export class VerifyCodeToken extends AccessToken {
    public constructor(uid: EntityId, data?: TokenData) {
        super(
            uid,
            new AccessTokenName(AccessTokenTypes.TOKEN_VERIFY_CODE),
            new AccessTokenSecret(VERIFY_TOKEN_SECRET),
            'icuc.social',
            data,
        );
    }

    public static verifyMe(jwtToVerify: string): VerifyCodeToken {
        // veirfy token lifetime is 5 minutes
        const twoFaTokenLifeTime = 300; // seconds
        const { id, data } = super.verify(
            jwtToVerify,
            new AccessTokenSecret(VERIFY_TOKEN_SECRET),
            twoFaTokenLifeTime,
        );
        return new VerifyCodeToken(
            new UserId(id),
            data,
        );
    }
}
