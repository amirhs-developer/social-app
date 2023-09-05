/* eslint-disable @typescript-eslint/no-unused-vars */
import { DoneCallback , Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { userService } from '@root/shared/services/db/user.service';


const log: Logger = config.createLogger('userWorker');


class UserWorker {

  async addUserToDatabase(job: Job , done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await userService.addUserData(value);
      job.progress(100);
      done(null, job.data);
    }catch(error){
      log.error(error);
      done(error as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();