const { Pool } = require('pg');

module.exports = class DatabaseConnection {
    constructor({ host, name, password, timeout, user, port, retryConnectionTimeoutMs, pollingConnectionStatusTimeoutMs, retryCount }, logger) {
        this.pollingConnectionStatusTimeoutMs = pollingConnectionStatusTimeoutMs;
        this.retryConnectionTimeoutMs = retryConnectionTimeoutMs;
        this.retryMaxCount = retryCount;
        this.retryCounter = 0;
        this.timeout = timeout;
        this.logger = {
            info: msg => logger.info(`[PGLOG] ${msg}`),
            warn: msg => logger.warn(`[PGLOG] ${msg}`),
            error: msg => logger.error(`[PGLOG] ${msg}`),
        };
        this.connectionString = `postgres://${user}:${password}@${host}:${port}/${name}`;
        const pgConfig = {
            connectionString: this.connectionString,
            ssl: false,
            statement_timeout: this.timeout,
        };
        this.pool = new Pool(pgConfig);
        this.pool.on('error', err => {
            this.logger.error(`Ошибка, message: ${err.message}, stack: ${err.stack}`);
            this.init();
        });
    }

    async checkConnection() {
        return this.pool
            .query('SELECT NOW()')
            .then(async () => true)
            .catch(async () => false);
    }

    async connect() {
        return this.pool
            .connect()
            .then(async () => {
                this.logger.info(`Успешное подключение`);
                return true;
            })
            .catch(async err => {
                this.logger.error(`Ошибка при подключении, message ${err.message}`);
                return false;
            });
    }

    async init() {
        const isConnected = await this.connect();
        if (!isConnected) {
            this.retryCounter++;
            if (this.retryCounter > this.retryMaxCount && this.retryMaxCount !== -1) {
                throw new Error('Не удалось подключиться за отведенное число попыток');
            }

            await new Promise(resolve => setTimeout(resolve, this.retryConnectionTimeoutMs));
            await this.init();
        }

        this.retryCounter = 0;
        if (this.pollingConnectionStatusTimeoutMs) {
            const isConnected = await this.checkConnection();
            if (!isConnected) {
                await new Promise(resolve => setTimeout(resolve, this.pollingConnectionStatusTimeoutMs));
                await this.init();
            }
            this.retryCounter = 0;
        }
    }
};
