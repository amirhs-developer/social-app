/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request , Response , NextFunction} from 'express';
import  JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { NotAuthorizedError } from './error.handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';

export class AuthMiddleware {

  public verifyUserAuthentication(req: Request , res: Response , next: NextFunction): void {

    if(!req.session?.jwt) {
      throw new NotAuthorizedError('token in not available. please login again .');
    }

    try {
      const payload: AuthPayload = JWT.verify(req.session?.jwt,config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError('token is invalid or expired. please login again');
    }
    next();
  }

  public checkAuthenticationUser(req: Request , res: Response , next: NextFunction): void {
    if(!req.currentUser){
      throw new NotAuthorizedError('authentication is required to access to this route');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
