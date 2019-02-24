require('dotenv').config();

const
    express = require('express'),
    app = express(),
    http = require('http'),
    port = process.env.APP_PORT,
    initRoutes = require('./routes/index'),
    initMiddleWare = require('./middleWare').initMiddleWare;
    logger = require('./init').logger;

const onError = (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            logger.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

const onListening = () => {

};

try {
    app.set('port', port);
    const server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    initMiddleWare(app, logger);
    initRoutes(app,  logger);
    logger.info(`[SEMPAI.HELP] Приложение запущено на порту: ${port}`);
} catch (err) {
    throw new Error(`При запуске приложения произошла ошибка ${err}`)
}

module.exports = app;
