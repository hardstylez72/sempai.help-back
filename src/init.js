const Sequelize = require('sequelize');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const uuidv1 = require('uuid/v1');
const logger = require('src/modules/logger').logger;
const storage = require('src/services/storage/routes');

const databaseConnection = require('src/services/storage/db/index');
const redisConnection = require('src/services/storage/redis/index');

const BASE_PATH = process.env.CONTENT_PATH;
const MUSIC_STYLES = ['ELECTRONIC', 'DUBSTEP', 'DUB', 'KAWAI', 'CASUAL', 'TRIP-HOP', 'HIP-HOP', 'BRUTAL', 'CLOUD', 'RAGGE'];

MUSIC_STYLES.forEach(style => {
    const isExist = fs.existsSync(BASE_PATH + '/' + style);
    if (!isExist) fs.mkdirSync(BASE_PATH + '/' + style);
});

module.exports.init = async (config, logger) => {
    const db = new databaseConnection(config.database, logger);
    await db.init();
    const redis = new redisConnection(config.redis, logger);
    await initSequilize(logger);

    return {
        logger: logger,
        db: db.pool,
        redis: redis.pool,
        seq: sequelize,
        Seq: Sequelize,
        storage: storage,
        libs: {
            moment: moment,
            _: _,
            uuidv1: uuidv1,
        },
    };
};

const sequelizeLogHandler = msg => {
    logger.info(msg);
};

const sequelize = new Sequelize(process.env.DB_SQL_NAME, process.env.DB_SQL_USER, process.env.DB_SQL_PWD, {
    logging: sequelizeLogHandler,
    host: process.env.DB_SQL_HOST,
    dialect: 'postgres',
    reconnect: true,
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 3000,
        idle: 1000,
    },
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info(`[Sequelize]: Успешное подключение к БД ${process.env.DB_SQL_NAME} под юзером ${process.env.DB_SQL_USER}`);
    } catch (err) {
        logger.error(`[Sequelize]: Ошибка при подключении к БД ${process.env.DB_SQL_NAME} под юзером ${process.env.DB_SQL_USER}`, err.message);
        throw err;
    }
};

const initSequilize = async logger => {
    try {
        await connectDB();
        sequelize['import']('./database/models.js');
        await sequelize.sync({ force: false });
        await sequelize.models.users.create({
            login: process.env.SITE_ADMIN_NAME,
            password: process.env.SITE_ADMIN_PWD,
            role_id: 1,
        });
        await sequelize.models.users.create({
            login: process.env.SITE_ADMIN_NAME_2,
            password: process.env.SITE_ADMIN_PWD_2,
            role_id: 1,
        });
        await sequelize.models.users.create({
            login: process.env.SITE_ADMIN_NAME_3,
            password: process.env.SITE_ADMIN_PWD_3,
            role_id: 1,
        });
        await sequelize.models.users.create({
            login: process.env.SITE_ADMIN_NAME_4,
            password: process.env.SITE_ADMIN_PWD_4,
            role_id: 1,
        });
    } catch (err) {
        logger.error(err);
    }
};

module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
