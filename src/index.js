require('dotenv').config();
/* eslint no-process-exit: "off" */
/* eslint node/prefer-global/process: "off" */

const express = require('express');
const app = express();
const http = require('http');
const port = process.env.APP_PORT;
const initRoutes = require('./routes/index');
const { initMiddleWare, } = require('./middleWare');
const { logger, } = require('src/modules/logger');
const { init, } = require('src/init');
const { config, } = require('src/config');

const onError = error => {
    if ('listen' !== error.syscall) {
        throw error;
    }
    const bind = 'string' === typeof port ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
    case 'EACCES':
        logger.error(bind + ' requires elevated privileges');
        process.exit(1);
    case 'EADDRINUSE':
        logger.error(bind + ' is already in use');
        process.exit(1);
    default:
        throw error;
    }
};

const onListening = () => {};

const serverStart = async logger => {
    try {
        const ctx = await init(config, logger);

        app.set('port', port);
        const server = http.createServer(app);

        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);
        app.use((req, res, next) => {
            req.ctx = ctx;

            return next();
        });
        initMiddleWare(app, logger);
        initRoutes(app, logger);
        logger.info(`[Сервер] Приложение запущено на порту: ${port}`);
    } catch (err) {
        throw err;
    }
};

serverStart(logger)
    .then()
    .catch();

module.exports = app;
