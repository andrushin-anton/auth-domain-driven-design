import { UserId } from '@domain/user/user-id';
import { Device } from './device';
import { DeviceId } from './device-id';

export interface DeviceRepository {
    findById(deviceId: DeviceId, userId: UserId): Promise<Device>;
    save(device: Device): Promise<void>;
}
