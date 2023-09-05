/* eslint-disable @typescript-eslint/no-unused-vars */
import HTTP_STATUS from 'http-status-codes';
import { Request , Response } from 'express';
import { loginSchema } from '@auth/schemes/signin';
import { joiValidation } from '@global/decorators/joi.validation.decorators';
import { authService } from '@root/shared/services/db/auth.service';
import { BadRequestError } from '@global/helpers/error.handler';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@root/shared/services/db/user.service';

export class SignIn {

  @joiValidation(loginSchema)
  public async login(req: Request , res: Response): Promise<void> {
    const { username , password } = req.body;

    console.log(username);


    // check user information in database exist or not
    const userExists : IAuthDocument = await authService.getAuthUserByUsername(username);

    if(!userExists) {
      throw new BadRequestError('user not exist');
    }

    const CorrectPassword : boolean =  await userExists.comparePassword(password);

    if(!CorrectPassword) {
      throw new BadRequestError('the password is incorrect');
    }

    const user: IUserDocument = await userService.getUserInformationByAuthId(`${userExists._id}`);

    const userJWT = JWT.sign(
      {
        userId: user._id,
        uId: userExists.uId,
        email: userExists.email,
        username: userExists.username,
        avatarColor: userExists.avatarColor,
      },
      config.JWT_TOKEN!
    );
    req.session = {jwt: userJWT};

    const userDocument: IUserDocument = {
      ...user,
      authId: userExists!.id,
      username: userExists!.username,
      email: userExists!.email,
      avatarColor: userExists!.avatarColor,
      uId: userExists!.uId,
      createdAt: userExists!.createdAt,
    } as IUserDocument;

    res.status(HTTP_STATUS.OK).json(
      {
        message: 'User login Successfully',
        user: userDocument,
        token: userJWT
      }
    );
  }

}
