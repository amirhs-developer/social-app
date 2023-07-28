import express , { Express } from 'express';

import { DatabaseConnection } from './setup.database';
import { ApplicationServer } from './setup.server';
import { config } from './config';

class Application {

    public initialize() : void {

        this.loadConfigurationEnvironment();

        const Database : DatabaseConnection = new DatabaseConnection();
        Database.start();

        const app : Express = express();

        const server : ApplicationServer = new ApplicationServer(app); // app reference to Application type
        server.start();

        app.listen(5001 , () => {
            console.log('ok');
            
        });
    }

    public loadConfigurationEnvironment() : void {
        config.validateConfigurationVariables();
    }
}

// create instance from Application Class 

const application : Application = new Application();

application.initialize();

