import { Error, isError } from 'tslint/lib/error';

const { createLogger, format, transports } = require('winston');
import * as winston from 'winston';

const loggerToConsole = createLogger({
    level : 'info',
    format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'HH:mm:ss:SSS' }),
        format.printf(info => `[${info.timestamp}] ${info.level
            .replace('info', '[INFO]')
            .replace('error', '[ERROR]')
            .replace('warn', '[WARN]')}: ${info.message}`),
    ),
    transports: [new transports.Console()],
});

/**
 * winston logger wrapper.
 * @WARNING: Logger instance must be configured with custom prefix
 */
export class Logger {
    private readonly prefix: string;
    private winstonLogger: winston.Logger;

    constructor(prefix: string) {
        this.prefix = prefix;
        this.winstonLogger = loggerToConsole;
    }

    /**
     * this function transports message data to console with log-level: info
     * @param {object | string | array | error} message - this is param to log
     * @returns {void}
     */
    public info(message: any): void {
        const log = message.toString();
        this.winstonLogger.info(`[${this.prefix}]: ${log}`);
    }

    /**
     * this function transports message data to console with log-level: warn
     * @param {object | string | array | error} message - this is param to log
     * @returns {void}
     */
    public warn(message: any): void {
        const log = message.toString();
        this.winstonLogger.warn(`[${this.prefix}]: ${log}`);
    }

    /**
     * this function transports message data to console with log-level: error
     * @param {Error} error - object of type Error
     * @param {object | string | array | error} message - this is param to log
     * @returns {void}
     */
    public error(error?: Error, message?: any): void {
        let log = '';
        if (isError(error)) {
            log = `${message} \n ${error.stack}`;
        }

        this.winstonLogger.error(`[${this.prefix}]: ${log}`);
    }
}