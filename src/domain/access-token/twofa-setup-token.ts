import { UserId } from '@domain/user/user-id';
import { EntityId } from '@domain/basic/value-object/entity-id';
import { AccessTokenSecret } from './access-token-secret';
import { AccessToken } from './access-token';
import { AccessTokenName, AccessTokenTypes } from './access-token-name';

const TWO_FA_TOKEN_SECRET = process.env.TWO_FA_TOKEN_SECRET ?? '';

export class TwoFaSetupToken extends AccessToken {
    public constructor(uid: EntityId) {
        super(
            uid,
            new AccessTokenName(AccessTokenTypes.TOKEN_2FA_SETUP),
            new AccessTokenSecret(TWO_FA_TOKEN_SECRET),
            'icuc.social',
        );
    }

    public static verifyMe(jwtToVerify: string): TwoFaSetupToken {
        // 2FA token lifetime is 20 minutes
        const twoFaTokenLifeTime = 1200; // seconds
        const { id } = super.verify(
            jwtToVerify,
            new AccessTokenSecret(TWO_FA_TOKEN_SECRET),
            twoFaTokenLifeTime,
        );
        return new TwoFaSetupToken(new UserId(id));
    }
}
