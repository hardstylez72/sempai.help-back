const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const { logger, seq, libs, redis, db } = req.ctx;
    const { _, uuidv1 } = libs;
    try {
        // const ip = req.connection._peername.address;
        const userToken = _.get(req, 'cookies.token', false);
        const tokenExist = await redis
            .get(userToken)
            .then(data => Promise.resolve(data))
            .catch(() => Promise.resolve(false));

        if (tokenExist) {
            res.cookie('token', userToken);
            res.cookie('is-token-ok', 1);
            return res.end(JSON.stringify({ success: 1, data: 'ok' }));
        }
        // todo: смотрим в  в бд
        const password = _.get(req, 'body.data.pwd', false);
        const login = _.get(req, 'body.data.login', false);
        if (password && login) {
            const user = await db.query(
                `
              select u.id
                 , u."login"
                 , u.role_id
                 , u.is_deleted
                from users.users u
                where u."password" = $1
                  and u."login" = $2;
            `,
                [password, login]
            );

            if (user.rowCount === 0) throw new Error('Авторизация: Пользователь не найден');

            const token = uuidv1();
            await redis.set(token, JSON.stringify(user.rows[0]), 'EX', process.env.REDIS_SESSION_LIFE_TIME);
            res.cookie('is-token-ok', 1);
            res.cookie('token', token);
            return res.end(JSON.stringify({ success: '1', data: 'ok' }));
        }
        throw new Error('Авторизация: Введены неверные данные при авторизации');
    } catch (err) {
        res.cookie('is-token-ok', 0);
        logger.error(err);
        const error = {};
        error.message = err.message;
        error.stack = err.stack;
        return res.end(JSON.stringify({ success: '0', error: error }));
    }
});

module.exports = router;
