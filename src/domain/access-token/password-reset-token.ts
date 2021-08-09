import { UserId } from '@domain/user/user-id';
import { EntityId } from '@domain/basic/value-object/entity-id';
import { AccessTokenSecret } from './access-token-secret';
import { AccessToken } from './access-token';
import { AccessTokenName, AccessTokenTypes } from './access-token-name';

const PASS_RESET_TOKEN_SECRET = process.env.PASS_RESET_TOKEN_SECRET ?? '';

export class PasswordResetToken extends AccessToken {
    public constructor(uid: EntityId) {
        super(
            uid,
            new AccessTokenName(AccessTokenTypes.TOKEN_PSWD_RESET),
            new AccessTokenSecret(PASS_RESET_TOKEN_SECRET),
            'icuc.social',
        );
    }

    public static verifyMe(jwtToVerify: string): PasswordResetToken {
        // 2FA token lifetime is 20 minutes
        const passResetTokenLifeTime = 1200; // seconds
        const { id } = super.verify(
            jwtToVerify,
            new AccessTokenSecret(PASS_RESET_TOKEN_SECRET),
            passResetTokenLifeTime,
        );
        return new PasswordResetToken(new UserId(id));
    }
}
