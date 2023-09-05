import { Application, json, urlencoded, Request, Response, NextFunction} from 'express';
import http from 'node:http';
import cors from 'cors'; // cross-origin resource sharing for handle http request headers
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from 'socket.io-redis-adapter';
import 'express-async-errors';
import Logger from 'bunyan';
import {config} from './config'; // configuration class for environments variables
import ApplicationRoutes from './routes'; // routes application from default export module
import { CustomError, IErrorResponse } from '@global/helpers/error.handler';

//? configuration and set up server class

// const SERVER_PORT = 5000; // default port

const log: Logger = config.createLogger('server');

export class ApplicationServer {
    // Properties or Fields
    private app : Application;

    // Constructor class
    constructor(app : Application) {
        this.app = app;
    }

    // methods
    public start() : void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routesMiddleware(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);
    }

    private securityMiddleware(app : Application) : void {
        app.use(
            cookieSession({
                name: 'session',
                keys: [config.SECRET_KEY_ONE!,config.SECRET_KEY_TWO!],
                // Cookie Options
                maxAge: 24 * 7 * 3600000, // 7 days
                secure: config.NODE_ENV !== 'development' // if == development secure is false else true
            })
        );

        app.use(hpp());
        app.use(helmet());

        app.use(
            cors({
                origin: config.CLIENT_URL,
                credentials: true,
                optionsSuccessStatus: 200,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            })
        );
    }

    private standardMiddleware(app : Application) : void {
        app.use(compression());
        app.use(json({limit: '50mb'}));
        app.use(urlencoded({extended: true , limit: '50mb'}));
    }

    private routesMiddleware(app : Application) : void {
        ApplicationRoutes(app);

    }

    private globalErrorHandler(app : Application) : void {

        app.all('*' , async (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({message: `${req.originalUrl} not found`});
        });

        app.use((error: IErrorResponse , _req: Request , res: Response , next: NextFunction) => {

            // console.log(error);
            log.error(error);

            if(error instanceof CustomError) {
                return res.status(error.statusCode).json(error.serializeErrors());
            }

            next();
        });

    }

    private async startServer(app : Application) : Promise<void> {
        try {
            // create http server instance from app (input => app : Express as Application from express)
            const httpServer : http.Server = new http.Server(app);

            // create socket io as http-server instance from app and return in SocketIO
            const socketIO : Server = await this.createSocketIO(httpServer);

            // start http server
            this.startHttpServer(httpServer);

            // start socketIO connection
            this.socketIOConnection(socketIO);

        } catch (error) {
           // check error connections
            log.error(error);
        }
    }

    private async createSocketIO(httpServer: http.Server) : Promise <Server>{

        // create instance of SocketIO
        const io : Server = new Server(httpServer , {
            cors: {
                origin: config.CLIENT_URL,
                methods: ['GET' , 'POST' , 'PUT' , 'DELETE' , 'OPTIONS'],
            }
        });

        const pubClient = createClient({url: config.REDIS_HOST}); // redis client
        const subClient = pubClient.duplicate(); // duplicate redis client

        await Promise.all([pubClient.connect() , subClient.connect()]);
        io.adapter(createAdapter(pubClient,subClient));
        return io;
    }

    // inside startServer method
    private startHttpServer(httpServer : http.Server) : void {
      log.info(`Server has started with process ${process.pid}`);

      httpServer.listen(config.PORT , () => {
          log.info(`Server running on port ${config.PORT}`);
      });
  }

    private socketIOConnection(io: Server): void {
      log.info('SocketIO connection');
    }
}







