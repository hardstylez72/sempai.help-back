module.exports = initRoutes = (app, logger) => {
    const createError = require('http-errors');

    const apiRoot = require('../api/routes');
    const multer = require('multer');
    const { config, } = require('../config/index');
    const storage = multer.memoryStorage();
    const fileUpload = multer({ storage, });

    app.get('/:api/:version/:object/:subject/:method/:data', async (req, res, next) => {
        try {
            const apiMethod = getApiMethod(apiRoot, req.params);
            req.ctx.res = res;
            const result = await apiMethod(req);
        } catch (err) {
            logger.error(`Error while processing API: ${req.originalUrl}`);
            logger.error(err);
        }
    });

    app.post('/:api/:version/:object/:subject/:method', fileUpload.array('files', config.MAX_COUNT_OF_FILES_CAN_BE_DOWNLOADED_WITH_MULTER), async (req, res, next) => {
        try {
            const apiMethod = getApiMethod(apiRoot, req.params);

            req.ctx.res = res;
            const result = await apiMethod(req);
            const response = {
                success: true,
                data   : result,
            };

            return res.send(JSON.stringify(response));
        } catch (err) {
            logger.error(`Error while processing API: ${req.originalUrl}`);
            logger.error(err);
            const response = {
                success: false,
                error  : {
                    message: err.message,
                    stack  : err.stack,
                },
            };

            return res.send(JSON.stringify(response));
        }
    });

    app.use((req, res, next) => {
        const data = {
            url    : req.originalUrl,
            method : req.method,
            body   : req.body,
            headers: req.headers,
            cookies: req.cookies,
        };

        logger.warn(`Ошибка 404 ${JSON.stringify(data)}}`);

        next(createError(404));
    });

    app.use((err, req, res, next) => {
        const data = {
            url    : req.originalUrl,
            method : req.method,
            body   : req.body,
            headers: req.headers,
            cookies: req.cookies,
        };

        logger.warn(`Ошибка 500 ${JSON.stringify(data)}`);
        res.locals.message = err.message;
        res.locals.error = 'development' === req.app.get('env') ? err : {};
        res.status(err.status || 500);
    });
};

const getApiMethod = (apiRoot, params) => {
    const { version, object, subject, method, } = params;

    const result = apiRoot[version][object][subject][method];

    return result;
};
