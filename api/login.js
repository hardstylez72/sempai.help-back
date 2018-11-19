const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const _ = require('lodash');
const redis = require('../init').redis;
const models = require('../init').sequelize.models;

router.post('/', async (req, res) => {
    const { logger } = req.ctx;
    try {
        console.log('req.body = ', req.body);
       // const ip = req.connection._peername.address;
       const userToken = _.get(req, 'cookies.token', false);
       const tokenExist = await redis.get(userToken)
           .then(data => Promise.resolve(data))
           .catch(() => Promise.resolve(false));

    if (tokenExist) {
        res.cookie('token', userToken);
        res.cookie('is-token-ok', 1);
        return res.end(JSON.stringify({success: 1, data: 'ok'}));
    }
    // todo: смотрим в  в бд
        const password = _.get(req, 'body.data.pwd', false);
        const login = _.get(req, 'body.data.login', false);
        if (password && login) {
            const user = await models.users.findOne({
                where: {
                    name: login,
                    pwd:  password
                }
            });
            if (!user) {
                throw new Error('Авторизация: Пользователь не найден');
            }
            const token = uuidv1();
            await redis.set(token, login, 'EX', process.env.REDIS_SESSION_LIFE_TIME);
            res.cookie('is-token-ok', 1);
            res.cookie('token', token);
            return res.end(JSON.stringify({success: '1', data: 'ok'}));
        }
        throw new Error('Авторизация: Введены неверные данные при авторизации');

    } catch (err) {
        res.cookie('is-token-ok', 0);
        logger.error(err);
        const error = {};
        error.message = err.message;
        error.stack = err.stack;
        return res.end(JSON.stringify({success: '0', error: error}));
    }
});

module.exports = router;


