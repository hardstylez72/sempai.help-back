const { createLogger, format, transports } = require('winston');

const loggerToConsole = createLogger({
    level: 'info',
    format: format.combine(
        format.colorize(),
        format.timestamp({
            format: 'HH:mm:ss:SSS',
        }),
        format.printf(
            info =>
                `[${info.timestamp}] ${info.level
                    .replace('info', '[INFO]')
                    .replace('error', '[ERROR]')
                    .replace('warn', '[WARN]')}: ${info.message}`
        )
    ),
    transports: [new transports.Console()],
});

const logger = {
    info: msg => loggerToConsole.info(msg),
    warn: msg => loggerToConsole.warn(msg),
    error: msg => loggerToConsole.error(msg),
};

module.exports.logger = logger;
