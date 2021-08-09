import { Entity } from '@domain/basic';
import { UserEmail } from './user-email';
import { UserId } from './user-id';
import { UserName } from './user-name';
import { UserPhone } from './user-phone';

interface UserSettingsToJson {
    name: string,
    email: string,
    phone: string,
}

export class UserSettings extends Entity {
    private name: UserName;

    private email: UserEmail;

    private phone?: UserPhone;

    constructor(id: UserId, name: UserName, email: UserEmail, phone?: UserPhone) {
        super(id);
        this.name = name;
        this.email = email;
        this.phone = phone;
    }

    serialize(object: UserSettingsToJson): UserSettingsToJson {
        const retObject = object;
        retObject.name = this.name.getValue();
        retObject.email = this.email.getValue();
        retObject.phone = (this.phone) ? this.phone.getValue() : '';
        return retObject;
    }
}
