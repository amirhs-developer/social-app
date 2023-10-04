/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import moment from 'moment';
import publicIP from 'ip';
import { config } from '@root/config';
import HTTP_STATUS from 'http-status-codes';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@root/shared/services/db/auth.service';
import { BadRequestError } from '@global/helpers/error.handler';
import { joiValidation } from '@global/decorators/joi.validation.decorators';
import { emailSchema , passwordSchema } from '@auth/schemes/password';
import crypto from 'crypto';
import { forgotPasswordTemplate } from '@root/shared/services/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@root/shared/services/queues/email.queue';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { resetPasswordTemplate } from '@root/shared/services/emails/templates/reset-password/reset-password-template';


export class Password {

  /**
   *  @des user send email and set Reset Password Link for user.
   *  req body email
   *  res messages
   *
   */
  @joiValidation(emailSchema)
  public async sendResetPasswordLinkToUser (req:Request , res: Response): Promise<void> {

    const { email } = req.body;

    const userExist: IAuthDocument = await authService.getAuthUserByEmail(email);
    if(!userExist) {
      throw new BadRequestError('invalid credentials. this email dose not exist !');
    }

    // generate random characters
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharactersToken : string = randomBytes.toString('hex');

    // update reset token user in auth model
    await authService.updateResetPasswordToken(
      `${userExist._id!}`,
       randomCharactersToken ,
       Date.now() * 60 * 60 * 1000 );

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharactersToken}`; // create url for reset
    // create template ejs
    const template: string = forgotPasswordTemplate.passwordResetTemplate(userExist.username!, resetLink);

    // add email Queue and send to redis then send email to user email address
    emailQueue.addEmailJob('forgotPasswordEmail',
      {
        template ,
        receiverEmail: userExist.email!,
        subject: 'Reset Your Password'
      });

    res.status(HTTP_STATUS.OK).json(
      {
        message: 'The Reset Token has been successfully sent to your email , Please check your email'
      });
  }

  /**
   *
   * @des validation matched password and confirmation and token (expired or not)
   * @param req password and confirm password and token in => (has in a reset link button )
   * @param res messages (password successfully updated)
   */
  @joiValidation(passwordSchema)
  public async updateUserPassword (req:Request , res: Response): Promise<void> {

    const { password , confirmPassword } = req.body;
    const { token } = req.params;

    if(password !== confirmPassword) {
      throw new BadRequestError('password do not match');
    }

    const userExist: IAuthDocument = await authService.getAuthUserByPasswordToken(token);
    if(!userExist) {
      throw new BadRequestError('invalid credentials. token is expired');
    }

    userExist.password = password;
    userExist.passwordResetExpires = undefined;
    userExist.passwordResetToken = undefined;
    await userExist.save();

    const templateParams: IResetPasswordParams = {
      username: userExist.username!,
      email: userExist.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm:ss')
    };

    // create ejs template
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);

    // add email Queue and send to redis then send email to user email address
    emailQueue.addEmailJob('forgotPasswordEmail',
      {
        template ,
        receiverEmail: userExist.email!,
        subject: 'Password Reset Confirmation.'
      });

    res.status(HTTP_STATUS.OK).json(
      {
        message: 'Done! Your Password has been Successfully Updated . '
      });
  }
}

