import { Response } from 'express';
import { AuthPayload } from '@auth/interfaces/auth.interface';



export const authMockRequest = (sessionData: IJWT , body: IAuthMock, currentUser?: AuthPayload | null, params?: any) => ({
  session: sessionData,
  body,
  currentUser,
  params,
});

export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IJWT {
  jwt?: string;
}

export interface IAuthMock {
  _id?: string;
  username?: string;
  email?: string;
  password?: string;
  uId?: string;
  avatarColor?: string;
  avatarImage?: string;
  createdAt?: Date | string;
}
