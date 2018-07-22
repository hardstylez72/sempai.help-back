var {sequelize, Sequelize} = require('./init');

//Table Links (link, descr, user)
var links = sequelize.define('links', {
    key: {
        type: Sequelize.INTEGER, 
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    link: {
        type: Sequelize.STRING(1000),
        allowNULL: false
    },
    descr: {
        type: Sequelize.STRING(4000),
        allowNULL: false
    },
    user: {
        type: Sequelize.STRING(50),
        allowNULL: false
    },
    abstract: {
        type: Sequelize.STRING(200),
        allowNULL: false
    },
    deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: 'false'
    }    
});

//Table Users (userName, userRole)
var users = sequelize.define('users', {
    userName: {
        type: Sequelize.STRING(40),
        allowNULL: false
    },
    userRole: {
        type: Sequelize.STRING(4000),
        allowNULL: false
    },
});

module.exports = (sequelize, Sequelize) => {
    return links, users;
}