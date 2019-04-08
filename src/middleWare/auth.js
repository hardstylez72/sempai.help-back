const authHandler = () => async (req, res, next) => {
    const { libs, storage} = req.ctx;
    const { cache } = storage;
    const { _, uuidv1, } = libs;

    if ('prod' !== process.env.NODE_ENV) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    }

    req.ctx.user ={ requestId: uuidv1(), };

    const userToken = _.get(req, 'cookies.token', false);

    if (userToken) {
        const user = await cache.get(userToken, req.ctx);

        if (user) {
            req.ctx.user = user;

            return next();
        }
    }

    if ('/api/v1/user/authorization/login' === req.url) {
        return next();
    }

    return res.end(JSON.stringify({
        success: '0',
        error  : { message: 'Авторизируйтесь', },
    }));
};

module.exports = authHandler;
