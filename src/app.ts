import express , { Express } from 'express';
import { DatabaseConnection } from '@root/setup.database';
import { ApplicationServer } from '@root/setup.server';
import { config } from '@root/config';

class Application {

    public initialize() : void {

        this.loadConfigurationEnvironment();

        const Database : DatabaseConnection = new DatabaseConnection();
        Database.start();

        const app : Express = express();

        const server : ApplicationServer = new ApplicationServer(app); // app reference to Application type
        server.start();
    }

    public loadConfigurationEnvironment() : void {
      // if env not set return a throw new error
        config.validateVariablesConfiguration();

      // set cloudinary configuration setup and connected to cloud.
        config.cloudinaryConfiguration();
    }
}

// create instance from Application Class

const application : Application = new Application();

application.initialize();





