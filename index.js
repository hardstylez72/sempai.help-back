const
	express = require('express'),
	http = require('http'),
	app = express(),
	dotenv = require('dotenv').config(),
	port = process.env.PORT;


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



if (Number(port) === NaN) {
	throw console.error('Для запуска приложения укажите порт в файле .env');
}
 try {
     app.set('port', port);
     const server = http.createServer(app);
     server.listen(port);
     server.on('error', onError);
     server.on('listening', onListening);
     console.log(`[SEMPAI.HELP] Приложение запущено на порту: ${port}`);
 } catch (err) {
	 throw new Error(`При запуске приложения произошла ошибка ${err.message}`)
 }






module.exports.app = app;