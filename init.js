const Sequelize = require('sequelize');
const dotenv = require('dotenv').config();

const sequelize = new Sequelize(dotenv.parsed.DBSQLNAME, dotenv.parsed.DBSQLUSER,  dotenv.parsed.DBSQLPWD, {
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

  //trying to establish connection to local database
  async function connectDB() {
      try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.import(__dirname + '/db-models.js');
        await sequelize.sync({force: true});
      }
      catch(err) {
        console.error(err);
        return err;
      }
    }
      
connectDB();


module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
module.exports.links = sequelize.links;
module.exports.users = sequelize.users;