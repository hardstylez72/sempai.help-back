const Sequelize = require('sequelize');
const Redis = require('ioredis');
const dotenv = require('dotenv').config();

// sudo docker run -it --rm --link some-postgres:postgres postgres psql -h postgres -U YOUR_DB_USE_USER
// sudo  docker run -it --rm --link some-postgres:postgres postgres pg_dump -h postgres -U sempai > /home/bozdo/Desktop/dump
const sequelize = new Sequelize(
    process.env.DB_SQL_NAME,
    process.env.DB_SQL_USER,
    process.env.DB_SQL_PWD, {
        host: process.env.DB_SQL_HOST,
        dialect: 'postgres',
        reconnect: () => {console.log('RECONECT!!!!!!!!!!')},
        operatorsAliases: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
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
    console.error("[Redis]: Ошибка", err.message);
});

redis.on("ready", () => {
    console.log("[Redis]: Готов к использованию");
});

redis.on("connect", () => {
    console.log("[Redis]: Успешное подключение");
});

redis.on("reconnecting", () => {
    console.log("[Redis]: Повторное подключение");
});

redis.on("end", () => {
    console.log("[Redis]: Соединение закрылось");
});

  //trying to establish connection to local database
const connectDB = async () => {
      try {
        await sequelize.authenticate();
        console.log(`[Sequelize]: Успешное подключение к БД ${process.env.DB_SQL_NAME} под юзером ${process.env.DB_SQL_USER}`);
      }
      catch(err) {
        console.error(`[Sequelize]: Ошибка при подключении к БД ${process.env.DB_SQL_NAME} под юзером ${process.env.DB_SQL_USER}`, err.message);
        throw err;
      }
};

(async () => {
    try {
        await connectDB();
        const models =  sequelize.import('./database/models.js');
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
        console.error(err);
    }
})();


module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
module.exports.redis = redis;