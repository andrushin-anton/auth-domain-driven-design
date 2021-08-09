import { UserId } from '@domain/user/user-id';
import { DeviceId } from '@domain/device/device-id';
import { Device } from '@domain/device/device';
import { DeviceRepository } from '@domain/device/device-repository';
import { NotFoundError } from '@common/errors/not-found-error';
import { Utilities } from '@common/utils';

export class InMemoryDeviceRepository implements DeviceRepository {
    private devices: Array<Device> = [
        new Device(
            new DeviceId('123-123-123'),
            new UserId('6b4fa55d-ee79-4b1a-adae-795c856539b3'),
            1,
            { name: 'John', email: 'john@gmail.com', userAgent: 'OS:Mac, Browser: Firefox' },
            Utilities.nowInSeconds(),
            Utilities.nowInSeconds(),
        ),
    ];

    async findById(deviceId: DeviceId, userId: UserId): Promise<Device> {
        let foundDeviceObj = new Device(
            new DeviceId(),
            new UserId(),
            0,
            { name: '', email: '', userAgent: 'OS:Mac, Browser: Firefox' },
            Utilities.nowInSeconds(),
            Utilities.nowInSeconds(),
        );
        let foundDevice = false;
        this.devices.forEach((object) => {
            if (userId.equals(object.getUserId()) && deviceId.equals(object.getId())) {
                foundDevice = true;
                foundDeviceObj = object;
            }
        });
        if (!foundDevice) {
            throw new NotFoundError();
        }
        return new Promise((resolve) => resolve(foundDeviceObj));
    }

    async save(device: Device): Promise<void> {
        let foundDevice = false;
        this.devices.forEach((object, index) => {
            if (device.getUserId().equals(object.getUserId())
            && device.getId().equals(object.getId())) {
                foundDevice = true;
                // need to update it
                this.devices[index] = device;
            }
        });
        if (!foundDevice) {
            // need to save it
            this.devices.push(device);
        }
        return new Promise((resolve) => {
            resolve();
        });
    }
}
