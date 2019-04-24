require('dotenv').config();
/* eslint no-process-exit: "off" */
/* eslint node/prefer-global/process: "off" */

import * as express from 'express';
import { Request, Response, NextFunction, Application } from 'express';

export interface SempaiRequest extends Request {
    ctx: {
        token:string,
        requestId: string,
        temp: any,
    };
}

const app: Application = express();
const http = require('http');

const { Logger } = require('src/modules/logger');

const log = new Logger('Server');

const { init } = require('src/init');
const { config } = require('src/config');

const { port } = config.server;
const { initMiddleWare } = require('./middleWare');
const { init: initRoutes } = require('./routing/index');

/**
 * @description
 * @param {Error} error - error object in server runtime
 */
const onError = (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
    case 'EACCES':
        log.error(`${bind} requires elevated privileges`);
        process.exit(1);
    case 'EADDRINUSE':
        log.error(`${bind} is already in use`);
        process.exit(1);
    default:
        throw error;
    }
};

const onListening = () => {};

/**
 * this function starts server to listen on configured port.
 * server configuration locates at src/config/index.js
 * @returns {Promise<void>}
 */
const startServer = async () => {
    try {
        const ctx = await init(config, log);
        const server = http.createServer(app);

        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);
        // app.enable('trust proxy');
        app.use((req: SempaiRequest, res: Response, next: NextFunction) => {
            req.ctx = ctx;

            return next();
        });
        initMiddleWare(app, log);
        initRoutes(app, log);
    } catch (err) {
        throw err;
    }
};

startServer()
    .then(() => log.info(`Server successfully running on port: ${port}`))
    .catch((err) => {
        log.error(err, 'Server start failed');
        throw err;
    });

module.exports = app;
