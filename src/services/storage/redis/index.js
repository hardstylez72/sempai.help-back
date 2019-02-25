const Redis = require('ioredis');

module.exports = class RedisConnection {
    constructor({ host, password, timeout, port, retryCount, retryConnectionTimeoutMs }, logger) {
        this.retryMaxCount = retryCount;
        this.timeout = timeout;
        this.logger = {
            info: msg => logger.info(`[Redis] ${msg}`),
            warn: msg => logger.warn(`[Redis] ${msg}`),
            error: msg => logger.error(`[Redis] ${msg}`),
        };
        const redisConfig = {
            port: Number(port),
            host: host,
            db: 0,
            connectTimeout: Number(this.timeout),
            password: password,
            retryStrategy: () => Number(retryConnectionTimeoutMs),
            maxRetriesPerRequest: this.retryMaxCount,
        };

        this.pool = new Redis(redisConfig);

        this.pool.on('error', err => {
            this.logger.error(`message: ${err.message}, stack: ${err.stack}`);
        });

        this.pool.on('ready', () => {
            this.logger.info('Готов к использованию');
        });

        this.pool.on('connect', () => {
            this.logger.info('Успешное подключение');
        });

        this.pool.on('reconnecting', () => {
            this.logger.info('Повторное подключение');
        });

        this.pool.on('end', () => {
            this.logger.error(' Соединение закрылось');
        });
    }
};
