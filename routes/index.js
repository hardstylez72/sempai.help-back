module.exports = initRoutes = (app, logger) => {

const createError = require('http-errors');
const
    indexRouter = require('../api/index'),
    usersRouter = require('../api/users'),
    musicStream = require('../api/musicStream'),
    imgUpload = require('../api/imgUpload'),
    music = require('../api/music'),
    addlink = require('../api/addlink'),
    login = require('../api/login'),
    favorite = require('../api/favorite'),
    upload = require('../api/music/upload/get');

    app.use('/api/', indexRouter);
    app.use('/api/users', usersRouter);
    app.use('/api/imgUpload', imgUpload);
    app.use('/api/addlink', addlink);
    app.use('/api/radio', musicStream);
    app.use('/api/music', music);
    app.use('/api/login', login);
    app.use('/api/track', favorite);
    app.use('/api/music/upload/get', upload);

    app.use((req, res, next) => {
        const data = {
            url: req.originalUrl,
            method: req.method,
            body: req.body,
            headers: req.headers,
            cookies: req.cookies
        };
        logger.warn(`Ошибка 404 ${JSON.stringify(data)}}`);

        next(createError(404));
    });


    app.use(function(err, req, res, next) {
        const data = {
            url: req.originalUrl,
            method: req.method,
            body: req.body,
            headers: req.headers,
            cookies: req.cookies
        };
        logger.warn(`Ошибка 500 ${JSON.stringify(data)}`);
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        res.status(err.status || 500);
        res.render('error');
    });
};

