/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from 'mongoose';
import {config} from '@root/config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('database');

import { redisConnection } from '@root/shared/services/redis/redis.connection';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

//  const connect = (url : string) : Promise <typeof mongoose> => {
//   return mongoose.connect(url , options);
// }


const connectToDatabase = () : Promise <typeof mongoose> => {
  return mongoose.connect(
    `${config.DATABASE_URL}`
  );
};

export class DatabaseConnection {

  public async start(): Promise <void> {
     this.startConnection();
  }

  private async startConnection(): Promise<void> {
    try {
      connectToDatabase();
      log.info('database connected successfully');
      redisConnection.connect();

    } catch (error) {
      log.error(error);
      return process.exit(1);
    }

    mongoose.connection.on('disconnected', connectToDatabase);
  }

}
