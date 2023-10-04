import { Request , Response } from 'express';
import * as uploadToCloudinry from '@global/helpers/cloudinary.uploads';
import { authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { SignUp } from '../signup';
import { CustomError } from '@global/helpers/error.handler';

jest.mock('@root/shared/services/queues/base.queue');
jest.mock('@root/shared/services/redis/user.cache');
jest.mock('@root/shared/services/queues/user.queue');
jest.mock('@root/shared/services/queues/auth.queue');
jest.mock('@global/helpers/cloudinary.uploads');

describe('SignUp', () => {

  it('should throw an error if username is not available', () => {

    const req: Request = authMockRequest({}, {
      username: '',
      email: 'amir.devask@gmail.com',
      password: 'admin123',
      avatarColor: 'red',
      avatarImage: ''
    }) as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req,res).catch((error: CustomError) => {
      console.log(error);
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required filed');
    });
  });

  it('should throw an error if username length is less than minimum length', () => {

    const req: Request = authMockRequest({}, {
      username: 'xa',
      email: 'amir.devask@gmail.com',
      password: 'admin123',
      avatarColor: 'red',
      avatarImage: ''
    }) as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req,res).catch((error: CustomError) => {
      console.log(error);
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid Username (<4)');
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {

    const req: Request = authMockRequest({}, {
      username: 'xxxxxxxxx',
      email: 'amir.devask@gmail.com',
      password: 'admin123',
      avatarColor: 'red',
      avatarImage: ''
    }) as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req,res).catch((error: CustomError) => {
      console.log(error);
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid Username (>8)');
    });
  });



});
