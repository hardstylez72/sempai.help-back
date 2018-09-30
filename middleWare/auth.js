const _ = require('lodash');
const redis = require('../init').redis;

const authHandler = () => {
    return async (req, res, next) => {
        const userToken = _.get(req, 'cookies.token', false);
        if (userToken) {
            const tokenExist = await redis.get(userToken);
            if (tokenExist) {
                return next();
            }
        }

        if (req.url === '/login/') {
            return next();
        }

        return res.send(JSON.stringify({success: '0', error: {message: 'Авторизируйтесь'}}));
    };
};

module.exports.authHandler = authHandler;