/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs';
import ejs from 'ejs';

class ForgotPasswordTemplate {

  public passwordResetTemplate(username: string , resetLink: string) : string {

    return ejs.render(fs.readFileSync(__dirname + '/forgot-password-template.ejs','utf8'), {
      username,
      resetLink,
      image_url: 'https://pluspng.com/img-png/png-lock-picture-lock-2-icon-1600.png'
    });
  }


}

export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate();

