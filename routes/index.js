

module.exports = initRoutes = (app, logger) => {

const createError = require('http-errors');
const destinations = require('../api/destinations');
const multer = require('multer');
const config = require('../config').config;
const storage = multer.memoryStorage();
const fileUpload = multer({storage: storage});
const login = require('../api/login');



    app.get('/:api/:version/:object/:subject/:method/:data', async (req, res, next) => {
        try {
            const apiMethod = getApiMethod(req.params.api, req.params.version, req.params.object, req.params.subject, req.params.method);
            const result = await apiMethod(req, res, {...req.ctx, mark: req.mark});
            return
        } catch(err) {
            return
        }
    });

    app.post('/:api/:version/:object/:subject/:method', fileUpload.array('files', config.MAX_COUNT_OF_FILES_CAN_BE_DOWNLOADED_WITH_MULTER), async (req, res, next) => {
        try {
            const apiMethod = getApiMethod(req.params.api, req.params.version, req.params.object, req.params.subject, req.params.method);

            const result = await apiMethod(req, {...req.ctx, mark: req.mark});
            const response = {
              success: true,
              data: result
            };
            return res.send(JSON.stringify(response));

        } catch(err) {

            const response = {
                success: false,
                error: err
            };
            return res.send(JSON.stringify(response));
        }
    });

    app.use('/api/login', login);

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


    app.use((err, req, res, next) => {
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

const getApiMethod = (...params) => {
    const path = '../' + params.reduce((acc, cur) => acc + '/' + cur) + '.js';
    const func = require(path);
    return func
};