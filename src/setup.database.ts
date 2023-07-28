import mongoose from 'mongoose';
import {config} from './config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('database');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  dbName: 'social-app',
};

//  const connect = (url : string) : Promise <typeof mongoose> => {
//   return mongoose.connect(url , options);
// }


const connectToDatabase = () : Promise <typeof mongoose> => {
  return mongoose.connect(
    `${config.DATABASE_URL}`,
    options
  );
};

export class DatabaseConnection {

  constructor() {
    
  }

  public async start(): Promise <void> {
    this.startConnection();
  }

  private async startConnection(): Promise<void> {
    try {
      connectToDatabase();
      log.info('database connected successfully');

    } catch (error) {
      log.error(error);
      return process.exit(1);
    }

    mongoose.connection.on('disconnected', connectToDatabase);
  }

}
