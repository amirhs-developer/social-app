/* eslint-disable @typescript-eslint/no-unused-vars */
// checking database

import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { Helpers } from '@global/helpers/helpers';

class AuthService {

  // signup
  public async createAuthUser(data: IAuthDocument) : Promise<void> {
    await AuthModel.create(data);
  }

  // sign up
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

  // login
  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {

    const user : IAuthDocument = await AuthModel.findOne({ username: Helpers.convertFirstLetterToUppercase(username) }).exec() as IAuthDocument;
    return user;
  }

  public async getAuthUserByEmail(email: string) : Promise<void> {

  }
}



// export instance form AuthService class

export const authService: AuthService = new AuthService();
