/* eslint-disable @typescript-eslint/no-unused-vars */
import { Application } from 'express';
import { authRoutes } from '@auth/routes/auth.routes';
import { serverAdapter } from '@root/shared/services/queues/base.queue';
import { currentUserRoutes } from '@auth/routes/current.routes';
import { AuthMiddleware, authMiddleware } from '@global/helpers/auth.middleware';

const BASE_PATH = '/api/v1';

export default (app : Application) => {

    const routes = () => {
      app.use('/queues', serverAdapter.getRouter());

      // authentication user route
      app.use(BASE_PATH , authRoutes.routes());
      app.use(BASE_PATH, authRoutes.signOutRoutes());

      app.use(BASE_PATH, authMiddleware.verifyUserAuthentication , currentUserRoutes.routes());

    };

    routes();
};
