const authHandler = () => async (req, res, next) => {
    const { redis, libs, } = req.ctx;
    const { _, uuidv1, } = libs;

    if ('prod' !== process.env.NODE_ENV) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    }

    req.mark = { requestId: uuidv1(), };
    const userToken = _.get(req, 'cookies.token', false);

    if (userToken) {
        const token = await redis.get(userToken);

        if (token) {
            const userInfo = JSON.parse(token);

            req.mark.sessionInfo = userInfo.login;
            req.mark.user = userInfo;

            return next();
        }
    }

    if ('/api/login/' === req.url) {
        return next();
    }

    return res.end(JSON.stringify({
        success: '0',
        error  : { message: 'Авторизируйтесь', },
    }));
};

module.exports = authHandler;
