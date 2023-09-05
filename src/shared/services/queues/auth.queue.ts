import { IAuthJob } from '@auth/interfaces/auth.interface';
import { BaseQueue } from './base.queue';
import { authWorker } from '@worker/auth.worker';

class AuthQueue extends BaseQueue {

  constructor() {
    super('auth');
    // add worker (and service worker with database model)
    this.processJob('addAuthUserToDatabase', 5 , authWorker.AddAuthUserToDatabase);
  }

  public addAuthUserJob(name: string , data: IAuthJob) {
    this.addJob(name , data);
  }
}

export const authQueue: AuthQueue = new AuthQueue();
