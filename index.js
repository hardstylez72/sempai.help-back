const
    _ = require('dotenv').config(),
    express = require('express'),
    app = express(),
    http = require('http'),
    port = process.env.APP_PORT,
    initRoutes = require('./routes/index'),
    initMiddleWare = require('./middleWare');

const onError = (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
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
    require('./init');
    initMiddleWare(app);
    initRoutes(app);
    console.log(`[SEMPAI.HELP] Приложение запущено на порту: ${port}`);
} catch (err) {
    throw new Error(`При запуске приложения произошла ошибка ${err.message}`)
}

module.exports = app;
