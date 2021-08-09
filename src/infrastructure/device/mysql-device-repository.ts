import { db } from '@common/mysql';
import { NotFoundError } from '@common/errors/not-found-error';
import { UserId } from '@domain/user/user-id';
import { Device } from '@domain/device/device';
import { DeviceId } from '@domain/device/device-id';
import { DeviceRepository } from '@domain/device/device-repository';

interface DeviceFromDb {
    id: string,
    user_id: string,
    times_activated: number,
    data: string,
    last_activated_at?: number,
    mfa_passed_at?: number,
}

export class MysqlDeviceRepository implements DeviceRepository {
    async findById(deviceId: DeviceId, userId: UserId): Promise<Device> {
        const deviceRow = await db.getrow<DeviceFromDb>('SELECT * FROM device WHERE id = ? AND user_id = ? LIMIT 1', [
            deviceId.getValue(),
            userId.getValue(),
        ]);
        if (!deviceRow) {
            throw new NotFoundError();
        }
        /* eslint-disable-next-line */
        const deviceData = JSON.parse(deviceRow.data);
        return new Device(
            new DeviceId(deviceRow.id),
            new UserId(deviceRow.user_id),
            deviceRow.times_activated,
            deviceData,
            deviceRow.last_activated_at,
            deviceRow.mfa_passed_at,
        );
    }

    async save(device: Device): Promise<void> {
        const query = `
            INSERT INTO device 
                (id,user_id,times_activated,last_activated_at,mfa_passed_at,data)
            VALUES(?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE 
                times_activated = VALUES(times_activated),
                last_activated_at = VALUES(last_activated_at),
                mfa_passed_at = VALUES(mfa_passed_at),
                data = VALUES(data)
        `;
        const bindParams = [
            device.getId().getValue(),
            device.getUserId().getValue(),
            device.getTimesActivated(),
            device.getLastActivatedAt() ?? null,
            device.getMfaPassedAt() ?? null,
            JSON.stringify(device.getData()),
        ];
        await db.execute(query, bindParams);
    }
}
