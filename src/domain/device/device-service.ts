import { CookieNotFoundError } from '@common/errors/cookie-not-found-error';
import { NotFoundError } from '@common/errors/not-found-error';
import { Required2FASetupError } from '@common/errors/required-2fa-setup-error';
import { RequiredDeviceVerificationError } from '@common/errors/required-device-verification-error';
import { AccessTokenTypes } from '@domain/access-token/access-token-name';
import { AccessTokenRepository } from '@domain/access-token/access-token-repository';
import { DeviceToken } from '@domain/access-token/device-token';
import { User } from '@domain/user/user';
import { Device } from './device';
import { DeviceId } from './device-id';
import { DeviceRepository } from './device-repository';

export class DeviceService {
    private accessTokenRepository: AccessTokenRepository;

    private deviceRepository: DeviceRepository;

    private userAgent?: string;

    constructor(
        accessTokenRepository: AccessTokenRepository,
        deviceRepository: DeviceRepository,
        userAgent?: string,
    ) {
        this.accessTokenRepository = accessTokenRepository;
        this.deviceRepository = deviceRepository;
        this.userAgent = userAgent;
    }

    public verify(user: User, device: Device): void {
        if (!user.getPhone()) {
            throw new Required2FASetupError();
        }
        if (!device.getMfaPassedAt()) {
            throw new RequiredDeviceVerificationError();
        }
    }

    public async getDevice(user: User): Promise<Device> {
        try {
            // let's read the device token from the client's device
            const deviceToken = this.accessTokenRepository.read(AccessTokenTypes.TOKEN_DEVICE);
            // found _device on client, lets read it from the storage
            const device = await this.deviceRepository.findById(deviceToken.getId(), user.getId());
            return device;
        } catch (e) {
            if (e instanceof CookieNotFoundError || e instanceof NotFoundError) {
                // possibly first time on this device
                // create new device object
                const deviceData = {
                    name: user.getName().getValue(),
                    email: user.getEmail().getValue(),
                    userAgent: this.userAgent ?? '',
                };
                const device = new Device(
                    new DeviceId(),
                    user.getId(),
                    0,
                    deviceData,
                );
                // save it to the db
                await this.deviceRepository.save(device);
                return device;
            }
            throw e;
        }
    }

    public async activateDevice(user: User): Promise<void> {
        const device = await this.getDevice(user);
        device.activate();
        const deviceToken = new DeviceToken(device.getId());
        this.accessTokenRepository.save(deviceToken);
        await this.deviceRepository.save(device);
    }
}
