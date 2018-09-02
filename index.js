const
	express = require('express'),
	http = require('http'),
	app = express(),
	dotenv = require('dotenv').config(),
	port = dotenv.parsed.PORT;

if (Number(port) === NaN) {
	throw console.error('Для запуска приложения укажите порт в файле .env');
}

	app.set('port', port);
	console.log('При ложение запущено на порту: ', port);
	const server = http.createServer(app);
	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);


function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	var bind = typeof port === 'string'
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
}

function onListening() {
	var addr = server.address();
	var bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
}

module.exports.app = app;