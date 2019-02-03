const Sequelize = require('sequelize');
const Redis = require('ioredis');
const winston = require('winston');
const { createLogger, format, transports }  = require('winston');
const moment = require('moment');
const path = require('path');
const fs = require( 'fs' );

const LOG_DIR = 'logs';
const INFO_LOGS_DIR = LOG_DIR +'/info';
const WARN_LOGS_DIR = LOG_DIR + '/warn';
const ERROR_LOGS_DIR = LOG_DIR + '/error';
const MAX_LOGFILE_SIZE_IN_BYTES = 10000000;

if ( !fs.existsSync( LOG_DIR ) ) {
    fs.mkdirSync( LOG_DIR );
}
if ( !fs.existsSync(INFO_LOGS_DIR) ) {
    fs.mkdirSync(INFO_LOGS_DIR);
}

if ( !fs.existsSync(WARN_LOGS_DIR) ) {
    fs.mkdirSync(WARN_LOGS_DIR);
}

if ( !fs.existsSync(ERROR_LOGS_DIR) ) {
    fs.mkdirSync(ERROR_LOGS_DIR);
}

const BASE_PATH = process.env.CONTENT_PATH;
const MUSIC_STYLES = [
    'ELECTRONIC',
    'DUBSTEP',
    'DUB',
    'KAWAI',
    'CASUAL',
    'TRIP-HOP',
    'HIP-HOP',
    'BRUTAL',
    'CLOUD',
    'RAGGE'
];

MUSIC_STYLES.forEach(style => {
    const isExist = fs.existsSync(BASE_PATH + '/' + style);
    if ( !isExist ) {
        fs.mkdirSync(BASE_PATH + '/' + style);
    }
});


const loggerToConsole = createLogger({

    level: 'info',
    format: format.combine(
        format.colorize(),
        format.timestamp({
            format: 'HH:mm:ss:SSS'
        }),
        format.printf(info => `[${info.timestamp}] ${info.level.replace('info', '[INFO]').replace('error', '[ERROR]').replace('warn', '[WARN]')}: ${info.message}`)
    ),
    transports: [new transports.Console()]
});
const loggerToFilesInfo = createLogger({

    level: 'info',
    pathname: './logs',
    format: format.combine(
        format.timestamp({
            format: 'MM/DD/YYYY - HH:mm:ss::SSS'
        }),
        format.printf(info => `[${info.timestamp}] ${info.level.replace('info', '[INFO]').replace('error', '[ERROR]').replace('warn', '[WARN]')}: ${info.message}`)
    ),
    transports: [
         new transports.File({
             filename: path.join(INFO_LOGS_DIR, `${moment().format('MM.DD.YYYY')}_.log`) ,
             maxsize: MAX_LOGFILE_SIZE_IN_BYTES,
         })
    ]
});

const loggerToFilesWarn = createLogger({

    level: 'info',
    pathname: './logs',
    format: format.combine(
        format.timestamp({
            format: 'MM/DD/YYYY - HH:mm:ss'
        }),
        format.printf(info => `[${info.timestamp}] ${info.level.replace('info', '[INFO]').replace('error', '[ERROR]').replace('warn', '[WARN]')}: ${info.message}`)
    ),
    transports: [
        new transports.File({
            filename: path.join(WARN_LOGS_DIR, `${moment().format('MM.DD.YYYY')}_.log`) ,
            maxsize: MAX_LOGFILE_SIZE_IN_BYTES,
        })
    ]
});

const loggerToFilesError = createLogger({

    level: 'info',
    pathname: './logs',
    format: format.combine(
        format.timestamp({
            format: 'MM/DD/YYYY - HH:mm:ss'
        }),
        format.printf(info => `[${info.timestamp}] ${info.level.replace('info', '[INFO]').replace('error', '[ERROR]').replace('warn', '[WARN]')}: ${info.message}`)
    ),
    transports: [
        new transports.File({
            filename: path.join(ERROR_LOGS_DIR, `${moment().format('MM.DD.YYYY')}_.log`) ,
            maxsize: MAX_LOGFILE_SIZE_IN_BYTES,
        })
    ]
});

const logger = module.exports.logger = {};

logger.info = (data) => {
    loggerToFilesInfo.info(data);
    loggerToConsole.info(data);
};

logger.warn = (data) => {
    loggerToFilesWarn.warn(data);
    loggerToConsole.warn(data);
};

logger.error = (data) => {
    loggerToFilesError.error(data);
    loggerToConsole.error(data);
};

const sequelizeLogHandler = (msg, type) => {
    logger.info(msg)
};

const sequelize = new Sequelize(
    process.env.DB_SQL_NAME,
    process.env.DB_SQL_USER,
    process.env.DB_SQL_PWD, {
        logging: sequelizeLogHandler,
        host: process.env.DB_SQL_HOST,
        dialect: 'postgres',
        reconnect: true,
        operatorsAliases: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 3000,
          idle: 1000
        },
  });



const redis = new Redis({
    host: process.env.REDIS_HOST,
    db: 0,
    password: process.env.REDIS_PWD,
    retryStrategy: (times) => Math.min(times * 500, 2000),
    maxRetriesPerRequest: 100
});

redis.on("error", err => {
    logger.error("[Redis]: Ошибка", err.message);
});

redis.on("ready", () => {
    logger.info("[Redis]: Готов к использованию");
});

redis.on("connect", () => {
    logger.info("[Redis]: Успешное подключение");
});

redis.on("reconnecting", () => {
    logger.info("[Redis]: Повторное подключение");
});

redis.on("end", () => {
    logger.info("[Redis]: Соединение закрылось");
});

  //trying to establish connection to local database
const connectDB = async () => {
      try {
        await sequelize.authenticate();
        logger.info(`[Sequelize]: Успешное подключение к БД ${process.env.DB_SQL_NAME} под юзером ${process.env.DB_SQL_USER}`);
      }
      catch(err) {
        logger.error(`[Sequelize]: Ошибка при подключении к БД ${process.env.DB_SQL_NAME} под юзером ${process.env.DB_SQL_USER}`, err.message);
        throw err;
      }
};

(async () => {
    try {
        await connectDB();
        sequelize.import('./database/models.js');
        await sequelize.sync({force: false});
        await sequelize.models.users.create({
            name: process.env.SITE_ADMIN_NAME,
            pwd: process.env.SITE_ADMIN_PWD,
            role_id: 1
        });
        await sequelize.models.users.create({
            name: process.env.SITE_ADMIN_NAME_2,
            pwd: process.env.SITE_ADMIN_PWD_2,
            role_id: 1
        });
    } catch (err) {
        logger.error(err);
    }
})();


module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
module.exports.redis = redis;