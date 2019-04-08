const fs = require('fs');
const _    = require('lodash');
const moment =      require('moment');
const uuidv1 = require('uuid/v1');
const storage = require('src/services/storage/routes');
const DatabaseConnection = require('src/services/storage/db/driver');
const RedisConnection =    require('src/services/storage/cache/driver');

const BASE_PATH = process.env.CONTENT_PATH;
const MUSIC_STYLES = [ 'ELECTRONIC', 'DUBSTEP', 'DUB', 'KAWAI', 'CASUAL', 'TRIP-HOP', 'HIP-HOP', 'BRUTAL', 'CLOUD', 'RAGGE', ];

MUSIC_STYLES.forEach(style => {
    const isExist = fs.existsSync(BASE_PATH + '/' + style);

    if (!isExist) {
        fs.mkdirSync(BASE_PATH + '/' + style);
    }
});

module.exports.init = async (config, logger) => {
    const db = new DatabaseConnection(config.database, logger);

    await db.init();
    const redis = new RedisConnection(config.redis, logger);

    return {
        config,
        logger,
        db   : db.pool,
        redis: redis.pool,
        storage,
        libs : {
            moment,
            _,
            uuidv1,
        },
    };
};
