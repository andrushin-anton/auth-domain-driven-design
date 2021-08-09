import { Utilities } from '@common/utils';
import { Entity } from '@domain/basic';
import { UserId } from '@domain/user/user-id';
import { DeviceId } from './device-id';

export interface DeviceData {
    name: string,
    email: string,
    userAgent: string,
}

interface DeviceToJson {
    id: string,
    userId: string,
    lastActivatedAt?: number,
    mfaPassedAt?: number,
    timesActivated: number;
    data: DeviceData;
}

export class Device extends Entity {
    private userId: UserId;

    private lastActivatedAt?: number;

    private mfaPassedAt?: number;

    private timesActivated: number;

    private data: DeviceData;

    constructor(
        deviceId: DeviceId,
        userId: UserId,
        timesActivated: number,
        data: DeviceData,
        lastActivatedAt?: number,
        mfaPassedAt?: number,
    ) {
        super(deviceId);
        this.userId = userId;
        this.timesActivated = timesActivated;
        this.data = data;
        this.lastActivatedAt = lastActivatedAt;
        this.mfaPassedAt = mfaPassedAt;
    }

    public getUserId(): UserId {
        return this.userId;
    }

    public getLastActivatedAt(): number | undefined {
        return this.lastActivatedAt;
    }

    public getMfaPassedAt(): number | undefined {
        return this.mfaPassedAt;
    }

    public getTimesActivated(): number {
        return this.timesActivated;
    }

    public getData(): DeviceData {
        return this.data;
    }

    public activate(): void {
        this.timesActivated += 1;
        this.lastActivatedAt = Utilities.nowInSeconds();
        this.mfaPassedAt = Utilities.nowInSeconds();
    }

    serialize(object: DeviceToJson): DeviceToJson {
        const retObject = object;
        retObject.userId = this.userId.getValue();
        retObject.lastActivatedAt = this.lastActivatedAt;
        retObject.mfaPassedAt = this.mfaPassedAt;
        retObject.data = this.data;
        return retObject;
    }
}
