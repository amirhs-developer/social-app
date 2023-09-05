import HTTP_STATUS from 'http-status-codes';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request , Response } from 'express';
import { UserCache } from '@root/shared/services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@root/shared/services/db/user.service';

const userCache: UserCache = new UserCache();

export class CurrentUser {

  public async currentUser(req: Request , res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;

    const cacheUser : IUserDocument =
    await userCache.getUserFromCacheServer(`${req.currentUser!.userId}`) as IUserDocument;

    const userExistsInCacheServer: IUserDocument =
    cacheUser ? cacheUser: await userService.getUserInformationByAuthId(`${req.currentUser!.userId}`);

    if(Object.keys(userExistsInCacheServer).length){
      isUser = true;
      token = req.session?.jwt;
      user = userExistsInCacheServer;
    }
    res.status(HTTP_STATUS.OK).json({token,isUser,user});
  }

  // authentication middleware
}
