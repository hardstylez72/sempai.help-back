const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const uuidv1 = require('uuid/v1');
const storage = require('src/services/storage/routes');
const { PostgresClient } = require('src/modules/clients/postgres');
const { RedisClient } = require('src/modules/clients/redis');
const { config } = require('src/config');
const { init: initORM } = require('src/orm/typeORM');

const { Logger } = require('src/modules/logger');

const log = new Logger('initialization');

module.exports.init = async () => {
    const { basePath, music } = config.content;
    const { styles } = music;
    await initORM();
    styles.forEach((style) => {
        const isExist = fs.existsSync(`${basePath}/${style}`);

        if (!isExist) {
            fs.mkdirSync(`${basePath}/${style}`);
        }
    });


    const logger = log;

    const { redis: redisConfig } = config;

    const redis = new RedisClient(
        redisConfig.host,
        redisConfig.port,
        redisConfig.password,
        redisConfig.timeoutMs,
        redisConfig.retryTimeoutMs,
    );

    return {
        config,
        logger,
        redis,
        storage,
        libs: {
            moment,
            _,
            uuidv1,
        },
    };
};
