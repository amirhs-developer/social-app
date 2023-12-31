import dotenv from 'dotenv';
dotenv.config({});

import bunyan from 'bunyan';
import Logger from 'bunyan';

const log : Logger = bunyan.createLogger({name: 'log' , level: 'debug'});

class Config {

  private readonly DEFAULT_DATABASE_URL = process.env.MONGO_URL;
  private readonly DEFAULT_PORT = 5000;

  public PORT: number | undefined;
  public DATABASE_URL: string | undefined;
  public JWT_TOKEN: string | undefined;
  public NODE_ENV: string | undefined;
  public SECRET_KEY_ONE: string | undefined;
  public SECRET_KEY_TWO: string | undefined;
  public CLIENT_URL: string | undefined;
  public REDIS_HOST : string | undefined;

  constructor() {

    this.PORT = Number(process.env.PORT) || this.DEFAULT_PORT;
    this.DATABASE_URL = process.env.MONGO_URL || this.DEFAULT_DATABASE_URL;
    this.JWT_TOKEN = process.env.JWT_TOKEN || '1234';
    this.NODE_ENV = process.env.NODE_ENV;
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || '';
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.REDIS_HOST = process.env.REDIS_HOST || '';
  }

  public createLogger(name: string) : bunyan {
    return bunyan.createLogger({name: name , level: 'debug'});
  }

  public validateConfigurationVariables() : void { 
    log.info(this);
    for (const [key , value] of Object.entries(this) ) {
        if(value === undefined) {
            throw new Error(`Configuration ${key} is undefined `);
        }
    }
  }

}


export const config: Config = new Config(); // export instance from config class
