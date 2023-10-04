/* eslint-disable @typescript-eslint/no-unused-vars */
import express , { Router } from 'express';
import { SignUp } from '@auth/controllers/signup';
import { SignIn } from '@auth/controllers/signin';
import { SignOut } from '@auth/controllers/signout';
import { Password } from '@auth/controllers/password';

class AuthRoutes {

  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {

    this.router.post('/signup' , SignUp.prototype.create);
    this.router.post('/signin', SignIn.prototype.login);
    this.router.post('/forgot-password', Password.prototype.sendResetPasswordLinkToUser);
    this.router.post('/reset-password/:token', Password.prototype.updateUserPassword);
    this.router.get('/signup' , SignUp.prototype.getSignUp);
    return this.router;

  }

  public signOutRoutes(): Router {

    this.router.get('/signout', SignOut.prototype.update);

    return this.router;
  }
};

export const authRoutes : AuthRoutes = new AuthRoutes();
