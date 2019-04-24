const apiRoot = require('../api/routes');
const multer = require('multer');
const { config } = require('../config/index');
const storage = multer.memoryStorage();
const fileUpload = multer({ storage });
import { Response, NextFunction, Application } from 'express';
import {SempaiRequest } from '../index';

const init = (app: Application, logger) => {
    const createError = require('http-errors');

    app.get('/:api/:version/:object/:subject/:method/:data', async (req: SempaiRequest, res: Response, next: NextFunction) => {
        try {
            const apiMethod = getApiMethod(apiRoot, req.params);
            await apiMethod(req, res);
        } catch (err) {
            logger.error(`Error while processing API: ${req.originalUrl}`);
            logger.error(err);
        }
    });

    app.post('/:api/:version/:object/:subject/:method', fileUpload.array('files', config.maxCountOfFilesCanBeDownloadedWithMulter), async (req: SempaiRequest, res:Response, next:NextFunction) => {
        try {
            const apiMethod = getApiMethod(apiRoot, req.params);
            const result = await apiMethod(req, res);
            const response = {
                success: true,
                data: result,
            };

            return res.send(JSON.stringify(response));
        } catch (err) {
            logger.error(`Error while processing API: ${req.originalUrl}`);
            logger.error(err);
            const response = {
                success: false,
                error: {
                    message: err.message,
                    stack: err.stack,
                },
            };

            return res.send(JSON.stringify(response));
        }
    });

    app.use((req, res, next) => {
        const data = {
            url: req.originalUrl,
            method: req.method,
            body: req.body,
            headers: req.headers,
            cookies: req.cookies,
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
            cookies: req.cookies,
        };

        logger.warn(`Ошибка 500 ${JSON.stringify(data)}`);
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        res.status(err.status || 500);
    });
};

const getApiMethod = (apiRoot, params) => {
    const {
        version, object, subject, method,
    } = params;

    const result = apiRoot[version][object][subject][method];

    return result;
};

export { init };
