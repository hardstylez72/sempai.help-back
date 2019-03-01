require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http');
const port = process.env.APP_PORT;
const initRoutes = require('./routes/index');
const initMiddleWare = require('./middleWare').initMiddleWare;
const logger = require('src/modules/logger').logger;
const init = require('src/init').init;
const config = require('src/config').config;

const onError = error => {
    if (error.syscall !== 'listen') throw error;

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

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
        throw new Error(`[Сервер] При запуске приложения произошла ошибка ${err}`);
    }
};

serverStart(logger)
    .then()
    .catch();

module.exports = app;
