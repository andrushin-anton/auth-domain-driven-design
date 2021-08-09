import compression from 'compression';
import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import { invitationRouter } from '@presentation/routes/invitation';
import {
    signupRouter,
    logoutRouter,
    loginRouter,
    authenticateRouter,
    twoFaDeviceRouter,
    twoFaSetupRouter,
    settingsRouter,
    settingsPasswordUpdateRouter,
    requestPasswordRouter,
    requestPasswordResetValidateRouter,
    resetPasswordRouter,
    settingsPhoneUpdateRouter,
} from './presentation/routes';
import { currentUser } from './common/middlewares/current-user';
import { NotFoundError } from './common/errors/not-found-error';
import { errorHandler } from './common/middlewares/error-handler';

const server = express();
server.use(compression());
server.set('trust proxy', true);
server.use(json());
server.use(cookieParser());

server.use(currentUser);
server.use(authenticateRouter);
server.use(loginRouter);
server.use(logoutRouter);
server.use(signupRouter);
server.use(twoFaSetupRouter);
server.use(twoFaDeviceRouter);
server.use(settingsRouter);
server.use(settingsPasswordUpdateRouter);
server.use(requestPasswordRouter);
server.use(requestPasswordResetValidateRouter);
server.use(resetPasswordRouter);
server.use(settingsPhoneUpdateRouter);
server.use(invitationRouter);

/* eslint-disable-next-line */
server.all('*', async (_req, _res) => {
    throw new NotFoundError();
});
server.use(errorHandler);
export { server };
