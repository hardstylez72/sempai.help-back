import redis = require('redis');
const { Logger } = require('src/modules/logger');
const log = new Logger('Redis');

/**
 * redis-client wrapper
 */
export class RedisClient {
    private client: redis.RedisClient;
    private readonly config: redis.ClientOpts;
    private readonly defaultLifeTimeMs = 1000 * 60 * 10;
    private readonly debug = process.env.NODE_ENV !== 'prod';
    constructor(
        host: string,
        port: number,
        password?: string,
        timeoutMs?: number,
        retryTimeoutMs?: number,
    ) {
        this.config = {
            port,
            host,
            password,
            db: 0, // todo: maybe move to config file
            connect_timeout: timeoutMs,
            retry_strategy: () => retryTimeoutMs,
        };

        this.client = redis.createClient(this.config);

        this.client.on('error', err => log.error(err));
        this.client.on('ready', () => log.info('Ready to use'));
        this.client.on('connect', () => log.info('Connection established'));
        this.client.on('reconnecting', () => log.info('Retrying to reconnect'));
        this.client.on('end', () => log.info('Connection closed'));
    }

    /**
     * this function is similar to original redis GET function
     * it goes to redis-server and trying to find key:value bundle by specified key in redis-store
     * @param {string} key - key of value you want to get
     * @returns {Promise<any>}
     */
    public async get(key: string): Promise<any> {
        if (this.debug) log.info(`trying to get value by key: ${key}`);
        return new Promise((resolve, reject) => this.client.get(key, (err, data) => {
            if (err) {
                if (this.debug) log.error(err, `error while trying to get value by key: ${key}`);
                return reject(err);
            }
            if (this.debug) log.info(`Successfully got value by key: ${key}`);
            return resolve(data);
        }));
    }

    /**
     * this function is similar to original redis SET function
     * it goes to redis-server and trying to put specified key:value with specified lifeTime in milliseconds in redis-store
     * @param {string} key - key of value you want to set
     * @param {string} value - value you want to set
     * @param {number} lifeTimeMs - lifetime of specified key:value bundle
     * @returns {Promise<any>}
     */
    public async set(key: string, value: string, lifeTimeMs: number  = this.defaultLifeTimeMs): Promise<any> {
        if (this.debug) log.info(`trying to set value: ${value} by key: ${key} lifeTime in milliseconds: ${lifeTimeMs}`);
        return new Promise((resolve, reject) => this.client.set(key, value, 'EX', lifeTimeMs, (err) => {
            if (err) {
                if (this.debug) log.error(err, `Error while trying to set value: ${value} by key: ${key} lifeTime in milliseconds: ${lifeTimeMs}`);
                return reject(err);
            }
            if (this.debug) log.info(`Successfully set value: ${value} by key: ${key} lifeTime in milliseconds: ${lifeTimeMs}`);
            return resolve();
        }));
    }
}