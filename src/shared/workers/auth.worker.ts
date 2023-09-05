// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DoneCallback , Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { authService } from '@root/shared/services/db/auth.service';

const log: Logger = config.createLogger('authWorker');

class AuthWorker {
  // add auth user to database method
  async AddAuthUserToDatabase(job: Job , done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await authService.createAuthUser(value);
      job.progress(100);
      done(null , job.data);

    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const authWorker: AuthWorker = new AuthWorker();