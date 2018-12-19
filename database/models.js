const {sequelize, Sequelize} = require('../init');

//Table Links (link, descr, user)
const links = sequelize.define('links',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        link: {
            type: Sequelize.STRING(1000),
            allowNull: false
        },
        descr: {
            type: Sequelize.STRING(4000),
            allowNull: false
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        abstract: {
            type: Sequelize.STRING(200),
            allowNull: false
        },
        deleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: 'false'
        }
    },
    { schema: 'links' }
);

//Table Users (userName, userRole)
const users = sequelize.define('users',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING(40),
            allowNull: false
        },
        pwd: {
            type: Sequelize.STRING(40),
            allowNull: false
        },
        role_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        deleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: 'false'
        }
    },
    { schema: 'users' }
);



const tracks = sequelize.define('tracks',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING(2048),
            allowNull: false
        },
        depth: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        isDirectory: {
            type: Sequelize.BOOLEAN,
            defaultValue: 'false'
        },
        path: {
            type: Sequelize.STRING(2048),
            allowNull: true
        },
        parent: {
            type: Sequelize.STRING(2048),
            allowNull: true
        },
        uploader_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        deleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: 'false'
        }
    },
    { schema: 'tracks' }
);

// Таблица связи пользователей и треков
const tastes = sequelize.define('tastes',
    {
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        track_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        deleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    },
    {
        schema: 'tastes',
    }
);

tastes.belongsTo(users,  {constraints: true, foreignKey: 'user_id'});
tastes.belongsTo(tracks,  {constraints: true, foreignKey: 'track_id'});
tastes.removeAttribute('id');


sequelize.createSchema('links', { ifNotExists: true });
sequelize.createSchema('users', { ifNotExists: true });
sequelize.createSchema('tastes', { ifNotExists: true });
sequelize.createSchema('tracks', { ifNotExists: true });

module.exports = (sequelize, Sequelize) => {
    return links, users, tracks, tastes;
};