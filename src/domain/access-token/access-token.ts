import jwt from 'jsonwebtoken';
import { TokenExpiredError } from '@common/errors/token-expired-error';
import { Utilities } from '@common/utils';
import { Entity, EntityId } from '@domain/basic';
import { AccessTokenName } from './access-token-name';
import { AccessTokenSecret } from './access-token-secret';

export interface TokenData {
    num?: string,
}

export interface TokenToJson {
    id: string,
    name: string,
    server: string,
    iat: number,
    data?: TokenData;
}

interface VerifyResponse {
    id: string,
    data?: TokenData,
}

export abstract class AccessToken extends Entity {
    private name: AccessTokenName;

    private server: string;

    private secret: AccessTokenSecret;

    private data?: TokenData;

    public constructor(
        uid: EntityId,
        name: AccessTokenName,
        secret: AccessTokenSecret,
        server: string,
        data?: TokenData,
    ) {
        super(uid);
        this.name = name;
        this.server = server;
        this.secret = secret;
        this.data = data;
    }

    public getName(): AccessTokenName {
        return this.name;
    }

    public getJWT(): string {
        // eslint-disable-next-line
        return jwt.sign(this.jsonSerialize() as any, this.secret.getValue());
    }

    public getData(): TokenData | undefined {
        return this.data;
    }

    public static verify(
        jwtToVerify: string,
        secret: AccessTokenSecret,
        tokenLifetime: number,
    ): VerifyResponse {
        const payload = jwt.verify(
            jwtToVerify,
            secret.getValue(),
        ) as TokenToJson;
        if (Utilities.nowInSeconds() > (payload.iat + tokenLifetime)) {
            throw new TokenExpiredError();
        }
        return { id: payload.id, data: payload.data };
    }

    public serialize(object: TokenToJson): TokenToJson {
        const retObject = object;
        retObject.name = this.name.getValue();
        retObject.data = this.data;
        retObject.server = this.server;
        return retObject;
    }
}
