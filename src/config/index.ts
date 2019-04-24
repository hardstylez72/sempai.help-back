/* eslint no-process-env: "off" */
/* eslint node/prefer-global/process: "off" */

const config = {
    server: {
        port: process.env.APP_PORT || 3000,
        APIs: {

        },
    },
    orm: {
        type: process.env.TYPEORM_CONNECTION,
        host: process.env.TYPEORM_HOST,
        port: Number(process.env.TYPEORM_PORT),
        database: process.env.TYPEORM_DATABASE,
        username: process.env.TYPEORM_USERNAME,
        password: process.env.TYPEORM_PASSWORD,
        migrationsRun: Boolean(process.env.TYPEORM_MIGRATIONS_RUN),
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        sessionLiveTime: Number(process.env.REDIS_SESSION_LIFE_TIME),
        password: process.env.REDIS_PWD,
        timeoutMs: Number(process.env.REDIS_TIMEOUT_MS),
        retryTimeoutMs: 2000,
    },
    contentPath: process.env.CONTENT_PATH,
    maxCountOfFilesCanBeDownloadedWithMulter: 1,
    content: {
        basePath: process.env.CONTENT_PATH,
        music: {
            styles: ['ELECTRONIC', 'DUBSTEP', 'DUB', 'KAWAI', 'CASUAL', 'TRIP-HOP', 'HIP-HOP', 'BRUTAL', 'CLOUD', 'RAGGE'],
        },
    },
};

export { config };
