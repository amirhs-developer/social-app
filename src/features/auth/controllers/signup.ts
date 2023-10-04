/* eslint-disable @typescript-eslint/no-unused-vars */
import  HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { Request , Response } from 'express';
import { IAuthDocument, ISignupData } from '@auth/interfaces/auth.interface';
import { signupSchema } from '@auth/schemes/signup';
import { joiValidation } from '@global/decorators/joi.validation.decorators';
import { authService } from '@root/shared/services/db/auth.service';
import { BadRequestError } from '@global/helpers/error.handler';
import { Helpers } from '@global/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';
import { uploadToCloudinry } from '@global/helpers/cloudinary.uploads';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@root/shared/services/redis/user.cache';
import { omit } from 'lodash';
import JWT from 'jsonwebtoken';
import { authQueue } from '@root/shared/services/queues/auth.queue';
import { userQueue } from '@root/shared/services/queues/user.queue';
import { config } from '@root/config';

// create redis user cache
const userCache : UserCache = new UserCache();


export class SignUp {

  //* input validation parameters
  @joiValidation(signupSchema)
  //* create user profile
  public async create(req: Request, res: Response): Promise<void> {

    // request fields
    const { username , password , email , avatarColor , avatarImage } = req.body;

    // check user information in database exist or not
    const userExists : IAuthDocument = await authService.getUserByUsernameOrEmail(username , email);

    if(userExists) {
      throw new BadRequestError('invalid credentials , user already exists');
    }

    // generate object id for user
    const authObjectId : ObjectId = new ObjectId(); // id for auth object _id
    console.log(authObjectId);
    const userObjectId : ObjectId = new ObjectId(); // id for user object
    console.log(userObjectId);
    const uId = `${Helpers.generateRandomIntegers(12)}`; // uid filed for user object

    // return IAuthDocument Interface and input ISignUp Interface
    // req.body data in input
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });

    // save user profile image to cloud storage
    const result : UploadApiResponse =
    await uploadToCloudinry(avatarImage , `${userObjectId}` , true , true) as UploadApiResponse;


    if(!result?.public_id){
      throw new BadRequestError('file upload : error uploading , try again later');
    }

    // save data to cache server as a UserDocument
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData , userObjectId);
    // save url to profile picture property
    userDataForCache.profilePicture = `https://res.cloudinary.com/di0quztf5/image/upload/v${result.version}/${userObjectId}`;
    // save to redis database
    userCache.saveUserToCache(`${userObjectId}`, uId , userDataForCache);

    // Save Auth and User to  Database (First Add To Dashboard)
    omit(userDataForCache , ['uId' , 'email' , 'username' , 'avatarColor' , 'password']); //remove properties
    authQueue.addAuthUserJob('addAuthUserToDatabase', { value: userDataForCache });
    userQueue.addUserJob('addUserToDatabase', {value: userDataForCache});

    // add jwt to session
    const userJWT : string = SignUp.prototype.GenerateSignUpToken(authData , userObjectId);

    req.session = { jwt: userJWT };

    res.status(HTTP_STATUS.CREATED).json(
      {
        message: 'User Created Successfully',
        user: userDataForCache,
        token: userJWT
      }
    );
  }

  //* generate jwt token ( access token )
  private GenerateSignUpToken(data: IAuthDocument , userObjectId: ObjectId) : string{

    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor,
      },
      config.JWT_TOKEN!
    );
  }


  //* signup data return IAuthDocument
  private signupData(data: ISignupData): IAuthDocument {

    const { _id , username , password , email , uId , avatarColor} = data;

    return {
      _id,
      uId,
      username: Helpers.convertFirstLetterToUppercase(username),
      email: Helpers.convertToLowerCase(email),
      password,
      avatarColor: avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }

  //* return user data as IUserDocument (All Auth And User)
  private userData(data: IAuthDocument , userObjectId:ObjectId) : IUserDocument {
    const {_id , username , email , uId , password , avatarColor} = data;

    return {
      _id: userObjectId,
      authId: userObjectId,
      uId, // not required in IUserDocument
      username: Helpers.convertFirstLetterToUppercase(username), // not required in IUserDocument
      email, // not required in IUserDocument
      password, // not required in IUserDocument
      avatarColor, // not required in IUserDocument
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;

  }

  // get signup data user profile
  public async getSignUp(req: Request , res: Response): Promise<void> {
    res.status(200).send('signup page');
  }
}
