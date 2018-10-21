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
    favorite = require('../api/favorite');

    app.use('/', indexRouter);
    app.use('/users', usersRouter);
    app.use('/imgUpload', imgUpload);
    app.use('/addlink', addlink);
    app.use('/radio', musicStream);
    app.use('/music', music);
    app.use('/login', login);
    app.use('/track', favorite);

    app.use((req, res, next) => {
        logger.warn(`Ошибка 404 ${{req}}`);
        next(createError(404));
    });


    app.use(function(err, req, res, next) {
        logger.warn(`Ошибка 500 ${{req}}`);
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        res.status(err.status || 500);
        res.render('error');
    });
};

