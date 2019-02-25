module.exports = {
    config: {
        database: {
            user: process.env.PG_USER,
            name: process.env.PG_DATABASE,
            password: process.env.PG_PASSWORD,
            host: process.env.PG_HOST,
            port: process.env.PG_PORT,
            timeout: process.env.PG_TIMEOUT_MS,
            retryConnectionTimeoutMs: 2000,
            pollingConnectionStatusTimeoutMs: 10000,
            retryCount: 100,
        },
        redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            sessionLiveTime: process.env.REDIS_SESSION_LIFE_TIME,
            password: process.env.REDIS_PWD,
            timeout: process.env.REDIS_TIMEOUT_MS,
            retryConnectionTimeoutMs: 2000,
            retryCount: 100,
        },
        MAX_COUNT_OF_FILES_CAN_BE_DOWNLOADED_WITH_MULTER: 1,
    },
};
