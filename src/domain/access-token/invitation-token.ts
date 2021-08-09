import { BadArgumentError } from '@common/errors/bad-argument-error';
import { InvalidTokenError } from '@common/errors/invalid-token-error';
import { EntityId } from '@domain/basic';
import { UserId } from '@domain/user/user-id';
import { AccessTokenName, AccessTokenTypes } from './access-token-name';
import { AccessToken } from './access-token';
import { AccessTokenSecret } from './access-token-secret';

const INVITATION_TOKEN_SECRET = process.env.INVITATION_TOKEN_SECRET ?? '';

export class InvitationToken extends AccessToken {
    public constructor(uid: EntityId) {
        super(
            uid,
            new AccessTokenName(AccessTokenTypes.TOKEN_INVITATION),
            new AccessTokenSecret(INVITATION_TOKEN_SECRET),
            'icuc.social',
        );
    }

    public static verifyMe(jwtToVerify: string): InvitationToken {
        if (!jwtToVerify) {
            throw new BadArgumentError('Invitation token is requred');
        }
        // invitation token lifetime is 14 days
        const tokenLifeTime = 1209600; // seconds
        try {
            const { id } = super.verify(
                jwtToVerify,
                new AccessTokenSecret(INVITATION_TOKEN_SECRET),
                tokenLifeTime,
            );
            return new InvitationToken(new UserId(id));
        } catch (err) {
            throw new InvalidTokenError();
        }
    }
}
