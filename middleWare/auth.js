const _ = require('lodash');
const redis = require('../init').redis;
const uuidv1 = require('uuid/v1');

const authHandler = () => {
    return async (req, res, next) => {
        req.mark = {
            requestId: uuidv1()
        };
        const userToken = _.get(req, 'cookies.token', false);
        if (userToken) {
            const tokenExist = await redis.get(userToken);
            if (tokenExist) {
                req.mark.sessionInfo = tokenExist;
                return next();
            }
        }

        if (req.url === '/api/login/') {
            return next();
        }

        return res.end(JSON.stringify({success: '0', error: {message: 'Авторизируйтесь'}}));
    };
};

module.exports = authHandler;