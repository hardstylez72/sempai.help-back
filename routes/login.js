const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const _ = require('lodash');
const redis = require('../init').redis;
const dotenv = require('dotenv').config();

router.post('/', async (req, res) => {
    try {
       // const ip = req.connection._peername.address;
       const userToken = _.get(req, 'cookies.token', false);
       const tokenExist = await redis.get(userToken);

    if (tokenExist) {
        res.cookie('token', userToken);
        res.cookie('is-token-ok', 1);
        return res.send(JSON.stringify({success: '1', data: 'ok'}));
    }
    // todo: смотрим в  в бд
        const password = _.get(req, 'body.pwd', false);
        const login = _.get(req, 'body.login', false);
    if (password === '1') {
        const token = uuidv1();
        await redis.set(token, "valid", 'EX', dotenv.parsed.REDIS_SESSION_LIFE_TIME);
        res.cookie('is-token-ok', 1);
        res.cookie('token', token);
        return res.send(JSON.stringify({success: '1', data: 'ok'}));
    }
        res.cookie('is-token-ok', 0);
        return res.send(JSON.stringify({success: '0', error: {message: 'Введены неверные данные при авторизации'}}));
    } catch (err) {
        console.log(err);
        const error = {};
        error.message = err.message;
        error.stack = err.stack;
        return res.send(JSON.stringify({success: '0', error: error}));
    }
});

module.exports = router;


