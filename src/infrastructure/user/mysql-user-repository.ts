import { UserNotFoundError } from 'src/common/errors/user-not-found-error';
import { db } from '@common/mysql';
import { User } from '@domain/user/user';
import { UserEmail } from '@domain/user/user-email';
import { UserId } from '@domain/user/user-id';
import { UserName } from '@domain/user/user-name';
import { UserPhone } from '@domain/user/user-phone';
import { UserRepository } from '@domain/user/user-repository';
import { UserSettings } from '@domain/user/user-settings';

interface UserDbResponse {
    id: string,
    name: string,
    email: string,
    password?: string,
    phone?: string,
    otp?: string,
    otp_iat?: number,
    last_used_invitation_token?: string,
    login_attempts: number,
    locked: boolean,
}

export class MysqlUserRepository implements UserRepository {
    public async findById(userId: UserId): Promise<User> {
        const userRow = await db.getrow<UserDbResponse>('SELECT * FROM user WHERE id = ? LIMIT 1', [userId.getValue()]);
        if (!userRow) {
            throw new UserNotFoundError();
        }
        const userPhone = userRow.phone ? new UserPhone(userRow.phone) : undefined;
        return new User(
            new UserId(userRow.id),
            new UserName(userRow.name),
            new UserEmail(userRow.email),
            userRow.password,
            userPhone,
            userRow.last_used_invitation_token,
            userRow.login_attempts,
            userRow.locked,
            userRow.otp,
            userRow.otp_iat,
        );
    }

    public async findByEmail(email: UserEmail): Promise<User> {
        const userRow = await db.getrow<UserDbResponse>('SELECT * FROM user WHERE email = ? LIMIT 1', [email.getValue()]);
        if (!userRow) {
            throw new UserNotFoundError();
        }
        const userPhone = userRow.phone ? new UserPhone(userRow.phone) : undefined;
        return new User(
            new UserId(userRow.id),
            new UserName(userRow.name),
            new UserEmail(userRow.email),
            userRow.password,
            userPhone,
            userRow.last_used_invitation_token,
            userRow.login_attempts,
            userRow.locked,
            userRow.otp,
            userRow.otp_iat,
        );
    }

    public async findUserSettings(userId: UserId): Promise<UserSettings> {
        const user = await this.findById(userId);
        const userSettings = new UserSettings(
            userId,
            user.getName(),
            user.getEmail(),
            user.getPhone(),
        );
        return userSettings;
    }

    public async save(user: User): Promise<void> {
        const query = `
            INSERT INTO user 
                (id,name,email,password,phone,last_used_invitation_token,login_attempts,locked,otp,otp_iat)
            VALUES(?,?,?,?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                password = VALUES(password),
                phone = VALUES(phone),
                last_used_invitation_token = VALUES(last_used_invitation_token),
                login_attempts = VALUES(login_attempts),
                locked = VALUES(locked),
                otp = VALUES(otp),
                otp_iat = VALUES(otp_iat)       
        `;
        const pass = user.getPassword() ?? null;
        const phone = user.getPhoneAsString();
        const lastUsedToken = user.getLastUsedInvitationToken() || null;
        const otp = user.getOtp() || null;
        const otpIat = user.getOtpIat() || null;

        const bindParams = [
            user.getId().getValue(),
            user.getName().getValue(),
            user.getEmail().getValue(),
            pass,
            phone,
            lastUsedToken,
            user.getLoginAttempts(),
            user.isLocked(),
            otp,
            otpIat,
        ];
        await db.execute(query, bindParams);
    }
}
