

module.exports = async (req, res) => {
    const { ctx, } = req;
    const { libs, storage, } = ctx;
    const { _, uuidv1, } = libs;
    const validateCredentials = storage.db.user.authorization.validate;
    const saveUserSession = storage.db.user.authorization.saveSession;
    const getUserByCredentials = storage.db.user.getByCredentials;
    const { cache, } = storage;

    const userToken = _.get(req, 'cookies.token', false);
    const password = _.get(req, 'body.data.pwd', null);
    const login = _.get(req, 'body.data.login', null);
    const ip = _.get(req, 'headers.x-forwarded-for', null);

    // const isUserLogged = await storage.cache.get(userToken, req.ctx);

    if (isUserLogged) {
        res.cookie('token-valid', true);
        res.cookie('token', userToken);

        return;
    }

    const isCredentialsValid = await validateCredentials({
        login,
        password,
    }, ctx);

    if (!isCredentialsValid) {
        res.cookie('token-valid', false);
        throw new Error('Invalid login credentials');
    }

    const user = await getUserByCredentials({
        login,
        password,
    }, ctx);

    const token = uuidv1();

    const sessionParams = {
        sessionId: token,
        ip,
        userId   : user.id,
    };

    await saveUserSession(sessionParams, ctx);

    const params = {
        key       : token,
        value     : user,
        lifeTimeMS: process.env.REDIS_SESSION_LIFE_TIME,
    };

    await cache.set(params, ctx);
    res.cookie('token-valid', true);
    res.cookie('token', token);
};
