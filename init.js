const Sequelize = require('sequelize');
const Redis = require('ioredis');
const dotenv = require('dotenv').config();

// sudo docker run --name some-postgres -p 5432:5432 -e POSTGRES_PASSWORD=mypass -e POSTGRES_USER=myuser -e POSTGRES_DB=mydbname -d postgres
// sudo docker run -it --rm --link some-postgres:postgres postgres psql -h postgres -U YOUR_DB_USE_USER
// sudo  docker run -it --rm --link some-postgres:postgres postgres pg_dump -h postgres -U sempai > /home/bozdo/Desktop/dump
const sequelize = new Sequelize(
    dotenv.parsed.DB_SQL_NAME,
    dotenv.parsed.DB_SQL_USER,
    dotenv.parsed.DB_SQL_PWD, {
        host: dotenv.parsed.DBSQLHOST,
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

// docker run --name redis.loc -p 6379:6379 -d redis:4-alpine --requirepass mypass
const redis = new Redis({
    db: 0,
    password: dotenv.parsed.REDIS_PWD,
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
        console.log(`[Sequelize]: Успешное подключение к БД ${dotenv.parsed.DB_SQL_NAME} под юзером ${dotenv.parsed.DB_SQL_USER}`);
      }
      catch(err) {
        console.error(`[Sequelize]: Ошибка при подключении к БД ${dotenv.parsed.DB_SQL_NAME} под юзером ${dotenv.parsed.DB_SQL_USER}`, err.message);
        throw err;
      }
};

(async () => {
    try {
        await connectDB();
        const models =  sequelize.import('./database/models.js');
        await sequelize.sync({force: false});
        await sequelize.models.users.create({
            name: dotenv.parsed.SITE_ADMIN_NAME,
            pwd: dotenv.parsed.SITE_ADMIN_PWD,
            role_id: 1
        });
        await sequelize.models.users.create({
            name: dotenv.parsed.SITE_ADMIN_NAME_2,
            pwd: dotenv.parsed.SITE_ADMIN_PWD_2,
            role_id: 1
        });
    } catch (err) {
        console.error(err);
    }
})();


module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
module.exports.redis = redis;