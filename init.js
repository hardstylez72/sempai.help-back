const Sequelize = require('sequelize');
const Redis = require('ioredis');
const dotenv = require('dotenv').config();

const sequelize = new Sequelize(dotenv.parsed.DB_SQL_NAME, dotenv.parsed.DB_SQL_USER,  dotenv.parsed.DB_SQL_PWD, {
    host: dotenv.parsed.DBSQLHOST,
    dialect: 'postgres',
    operatorsAliases: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  });

// docker run --name redis.loc -p 6379:6379 -d redis:4-alpine
const redis = new Redis({
    retryStrategy: function (times) {
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
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
  async function connectDB() {
      try {
        await sequelize.authenticate();
        console.error(`[Sequelize]: Успешное подключение к БД ${dotenv.parsed.DB_SQL_NAME} под юзером ${dotenv.parsed.DB_SQL_USER}`);
        await sequelize.import(__dirname + '/db-models.js');
        await sequelize.sync({force: true});
      }
      catch(err) {
        console.error(`[Sequelize]: Ошибка при подключении к БД ${dotenv.parsed.DB_SQL_NAME} под юзером ${dotenv.parsed.DB_SQL_USER}`, err.message);
        return err;
      }
    }
      
connectDB();


module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
module.exports.links = sequelize.links;
module.exports.users = sequelize.users;
module.exports.redis = redis;