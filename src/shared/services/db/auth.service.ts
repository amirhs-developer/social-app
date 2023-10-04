/* eslint-disable @typescript-eslint/no-unused-vars */
// checking database

import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { Helpers } from '@global/helpers/helpers';

class AuthService {

  // create auth user model
  public async createAuthUser(data: IAuthDocument) : Promise<void> {
    await AuthModel.create(data);
  }

  // reset password
  public async updateResetPasswordToken(authId: string , token: string , tokenExpiration: number) : Promise<void> {

    await AuthModel.updateOne({ _id: authId } , {
      passwordResetToken: token,
      passwordResetExpires: tokenExpiration
    });
  }


  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {

    const query = {
      $or: [
        { username: Helpers.convertFirstLetterToUppercase(username) },
        { email: Helpers.convertToLowerCase(email) }
      ]
    };

    const user : IAuthDocument = await AuthModel.findOne(query).exec() as IAuthDocument;
    return user;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {

    const user : IAuthDocument = await AuthModel.findOne({ username: Helpers.convertFirstLetterToUppercase(username) }).exec() as IAuthDocument;
    return user;
  }

  public async getAuthUserByEmail(email: string) : Promise<IAuthDocument> {
    const user : IAuthDocument = await AuthModel.findOne({ email: Helpers.convertToLowerCase(email) }).exec() as IAuthDocument;
    return user;
  }

  // update user password with reset link
  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
    const user : IAuthDocument = (await AuthModel.findOne(
      {
         passwordResetToken: token,
         passwordResetExpires: { $gt: Date.now() } // if greater than true or less than return null (expire)
      },
      ).exec() ) as IAuthDocument;
    return user;
  }
}



// export instance form AuthService class

export const authService: AuthService = new AuthService();
