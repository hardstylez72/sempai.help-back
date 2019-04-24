// this module can be deprecated for unnecessary. It is not used anywhere

import pg = require('pg');
const { Logger } = require('src/modules/logger');
const log = new Logger('Postgres');

/**
 * PostgresSQL wrapper
 */
export class PostgresClient {
    private readonly config: pg.ConnectionConfig;
    private readonly connectionString: string;
    private readonly retryCount: number;
    private readonly retryTimeoutMs: number;
    private readonly debug = process.env.NODE_ENV !== 'prod';
    public pool: pg.Pool;
    constructor(
        host: string,
        databaseName: string,
        user: string,
        port: number,
        retryTimeoutMs?: number,
        retryCount?: number,
        password?: string,
        timeoutMs?: number,
    ) {
        this.retryCount = retryCount ? retryCount : -1;
        this.retryTimeoutMs = retryTimeoutMs ? retryTimeoutMs : 0;
        this.connectionString = `postgres://${user}:${password}@${host}:${port}/${databaseName}`;
        this.config = {
            connectionString: this.connectionString,
            statement_timeout: timeoutMs,
        };

        this.pool = new pg.Pool(this.config);
        this.pool.on('error', (err) => {
            log.error(err, 'Error in runtime');
        });
    }

    /**
     * this function checks connection of server with pg-database.
     * @returns {Promise<boolean>} - connection established or not
     * returns {true} when connection established
     * returns {false} when server is not connected to database
     */
    private async checkConnection() {
        if (this.debug) log.info('Checking connection status');
        return this.pool
            .query('SELECT NOW()')
            .then(async () => {
                if (this.debug) log.info('Connection established');
                return true;
            })
            .catch(async (err) => {
                if (this.debug) log.error(err, 'Can not establish connection');
                return false;
            });
    }

    /**
     * this function trying to establish connection to pg-database
     * @returns {Promise<boolean>} - connection established or not
     * returns {true} when connection established
     * returns {false} when server is not connected to database
     */
    private async connect() {
        return this.pool
            .connect()
            .then(async () => {
                if (this.debug) log.info('Connection established');
                return true;
            })
            .catch(async (err) => {
                if (this.debug) log.error(err, 'Can not establish connection');
                return false;
            });
    }

    /**
     * this function is a wrapper for connect function.
     * it ensures retries mechanism
     * @returns {Promise<void>}
     */
    public async init() {
        let retryCounter = 0;
        let isConnected = await this.checkConnection();
        while (!isConnected || retryCounter > this.retryCount) {
            isConnected = await this.connect();
            if (this.debug) log.info(`Number of reconnect attempts: ${this.retryCount} number of current: ${retryCounter}`);
            retryCounter = retryCounter + 1;
            await new Promise(resolve => setTimeout(resolve, this.retryTimeoutMs));
        }
        if (!isConnected) {
            throw new Error('Can not establish connection to pg-database');
        }
        if (this.debug) log.info('Ready to use');
    }

    /**
     * Query to pg-database
     * @param {Query} query - query body
     * @returns {Promise<QueryResult>}
     */
    public async query(query: pg.Query): Promise<pg.Query> {
        await this.init();
        return this.pool.query(query);
    }
}
