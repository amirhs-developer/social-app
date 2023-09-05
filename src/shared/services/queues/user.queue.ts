import { IAuthJob } from '@auth/interfaces/auth.interface';
import { BaseQueue } from './base.queue';
import { userWorker } from '@worker/user.worker';

class UserQueue extends BaseQueue {

  constructor() {
    super('user');
    // add worker (and service worker with database model)
    this.processJob('addUserToDatabase', 5 , userWorker.addUserToDatabase);
  }

  public addUserJob(name: string , data: any) {
    this.addJob(name , data);
  }
}

export const userQueue: UserQueue = new UserQueue();
