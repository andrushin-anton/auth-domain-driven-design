import { TokenExpiredError } from 'jsonwebtoken';
import { RequiredDeviceVerificationError } from '@common/errors/required-device-verification-error';
import { DeviceId } from '@domain/device/device-id';
import { EntityId } from '@domain/basic/value-object/entity-id';
import { AccessTokenSecret } from './access-token-secret';
import { AccessToken } from './access-token';
import { AccessTokenName, AccessTokenTypes } from './access-token-name';

const DEVICE_TOKEN_SECRET = process.env.DEVICE_TOKEN_SECRET ?? '';

export class DeviceToken extends AccessToken {
    public constructor(uid: EntityId) {
        super(
            uid,
            new AccessTokenName(AccessTokenTypes.TOKEN_DEVICE),
            new AccessTokenSecret(DEVICE_TOKEN_SECRET),
            'icuc.social',
        );
    }

    public static verifyMe(jwtToVerify: string): DeviceToken {
        try {
            // device token lifetime is 30 days
            const deviceTokenLifeTime = 2592000; // seconds
            const { id } = super.verify(
                jwtToVerify,
                new AccessTokenSecret(DEVICE_TOKEN_SECRET),
                deviceTokenLifeTime,
            );
            return new DeviceToken(new DeviceId(id));
        } catch (e) {
            if (e instanceof TokenExpiredError) {
                throw new RequiredDeviceVerificationError();
            }
            throw e;
        }
    }
}
