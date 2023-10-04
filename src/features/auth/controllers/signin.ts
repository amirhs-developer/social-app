/* eslint-disable @typescript-eslint/no-unused-vars */
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { Request , Response } from 'express';
import { loginSchema } from '@auth/schemes/signin';
import { joiValidation } from '@global/decorators/joi.validation.decorators';
import { authService } from '@root/shared/services/db/auth.service';
import { BadRequestError } from '@global/helpers/error.handler';
import { config } from '@root/config';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IResetPasswordParams, IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@root/shared/services/db/user.service';
import { TransportMailer } from '@root/shared/services/emails/mail.transport';
import moment from 'moment';
import publicIP from 'ip';
import { resetPasswordTemplate } from '@root/shared/services/emails/templates/reset-password/reset-password-template';
import { forgotPasswordTemplate } from '@root/shared/services/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@root/shared/services/queues/email.queue';

export class SignIn {

  @joiValidation(loginSchema)
  public async login(req: Request , res: Response): Promise<void> {
    const { username , password } = req.body;

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

    // sending a password reset link to the user's email for changing the password.
    // send The message of the success of changing the password of the account
    const userInfoTemplateParams: IResetPasswordParams = {
      username: userExists.username!,
      email: userExists.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm:ss'),
    };
    // create template (message for send to user -> use ejs template)
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(userInfoTemplateParams);
    emailQueue.addEmailJob('forgotPasswordEmail',
    {
      template,
      receiverEmail: 'jackie.bogisich75@ethereal.email',
      subject: 'Password Reset Configuration'
    }
    );

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
