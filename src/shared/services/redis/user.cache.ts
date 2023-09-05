import { BaseCache } from '@root/shared/services/redis/base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { ServerError } from '@global/helpers/error.handler';
import Logger from 'bunyan';
import { config } from '@root/config';
import { Helpers } from '@global/helpers/helpers';
const log:Logger = config.createLogger('userCache');


// userCache for add user to redis cache

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  //* save user properties in redis cache by zadd
  public async saveUserToCache(key: string, userId: string, createdUser: IUserDocument): Promise<void> {
    // create a new Date() for user
    const createdAt = new Date();

    // destructure user from user interface
    const {
      _id ,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;

    // create first list for user properties
    const firstList: string[] = [
      '_id',`${_id}`,
      'uId', `${uId}`,
      'username' , `${username}`,
      'email' , `${email}`,
      'avatarColor' , `${avatarColor}`,
      'createdAt' , `${createdAt}`,
      'postsCount' , `${postsCount}`
    ];

    // create second list for user properties
    const secondList: string[] = [
      'blocked' , JSON.stringify(blocked),
      'blockedBy' , JSON.stringify(blockedBy),
      'profilePicture' , `${profilePicture}`,
      'followersCount' , `${followersCount}`,
      'followingCount' , `${followingCount}`,
      'notifications' , JSON.stringify(notifications),
      'social' , JSON.stringify(social)
    ];

    // create third list for user properties
    const thirdList : string[] = [
      'work' , `${work}`,
      'location', `${location}`,
      'school' , `${school}`,
      'quote' , `${quote}`,
      'bgImageVersion' , `${bgImageVersion}`,
      'bgImageId' , `${bgImageId}`
    ];

    // save data
    const saveData: string[] = [...firstList,...secondList,...thirdList];

    try {
      if(!this.client.isOpen){
        await this.client.connect();
      }

      // score: userId => random number from uid generator
      // value: key => user object id
      await this.client.ZADD('user', {score: parseInt(userId,10) , value: `${key}`});
      await this.client.HSET(`users:${key}` , saveData);

    } catch (error) {
      log.error(error);
      throw new ServerError('server error , try again');
    }
  }

  //* get user information ( auth and user model ) from remote dictionary server (redis user Cache (: )
  public async getUserFromCacheServer(userId: string): Promise<IUserDocument | null> {
    try {
      if(!this.client.isOpen){
        this.client.connect();
      }

      const response : IUserDocument = await this.client.HGETALL(`users:${userId}`) as unknown as IUserDocument;
      response.createdAt = new Date(Helpers.parseJSON(`${response.createdAt}`));
      response.postsCount = Helpers.parseJSON(`${response.postsCount}`);
      response.blocked = Helpers.parseJSON(`${response.blocked}`);
      response.blockedBy = Helpers.parseJSON(`${response.blockedBy}`);
      response.notifications = Helpers.parseJSON(`${response.notifications}`);
      response.social = Helpers.parseJSON(`${response.social}`);
      response.followersCount = Helpers.parseJSON(`${response.followersCount}`);
      response.followingCount = Helpers.parseJSON(`${response.followingCount}`);

      return response;

    } catch (error) {
      log.error(error);
      throw new ServerError('server error , try again');
    }
  }
}
