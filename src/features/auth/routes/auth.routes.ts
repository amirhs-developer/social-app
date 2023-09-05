/* eslint-disable @typescript-eslint/no-unused-vars */
import express , { Router } from 'express';
import { SignUp } from '@auth/controllers/signup';
import { SignIn } from '@auth/controllers/signin';
import { SignOut } from '@auth/controllers/signout';

class AuthRoutes {

  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup' , SignUp.prototype.create);
    this.router.post('/signin', SignIn.prototype.login);
    this.router.get('/signup' , SignUp.prototype.getSignUp);

    return this.router;
  }

  public signOutRoutes(): Router {

    this.router.get('/signout', SignOut.prototype.update);

    return this.router;
  }
};

export const authRoutes : AuthRoutes = new AuthRoutes();
