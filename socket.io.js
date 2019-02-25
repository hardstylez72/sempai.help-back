const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const unzip = require('unzip');
const _ = require('lodash');
const logger = require('./src/init').logger;
const seq = require('./src/init').sequelize.models;
const redis = require('./src/init').redis;
const util = require('util');
const dirTree = require('directory-tree');

const port = process.env.WEB_SOCKET_PORT;
const app = express();

const server = http.createServer(app);
const fileMap = new Map();
const io = socketIO(server);

const TEST_DIR = process.env.CONTENT_PATH;

if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR);
}

io.use(async (req, next) => {
    try {
        let userToken = _.get(req, 'client.request.headers.cookie', false);
        if (userToken) {
            userToken = userToken.split(';').filter(el => el.indexOf('token=') !== -1);
            userToken = userToken[0].split('=');
            userToken = userToken[1];
            const tokenExist = await redis.get(userToken);
            if (tokenExist) {
                req.ctx = {
                    sessionInfo: tokenExist,
                };
                logger.info('Успешное прохождение авторизации при подключении к сокету');
                return next();
            }
        }
        return next(new Error('Ошибка при авторизации'));
    } catch (err) {
        logger.error('Ошибка при авторизации при подключении к сокету');
        return next(new Error('Ошибка при авторизации'));
    }
});

io.on('connection', socket => {
    logger.info('User connected');

    socket.on('disconnect', () => {
        logger.info('user disconnected');
    });

    socket.on('START_UPLOAD', data => {
        try {
            if (data.name.indexOf('.zip') === -1) {
                return errorHandler(socket, fileMap, data, 'Неверный формат загружаемого контента');
            }
            fileMap.set(data.name, {
                size: data.size,
                curSize: 0,
                stream: fs.createWriteStream(TEST_DIR + '/' + data.path + '/' + data.name),
                localPath: TEST_DIR + '/' + data.path + '/' + data.name,
                name: data.name,
                path: data.path,
            });
        } catch (err) {
            errorHandler(socket, fileMap, data, err);
        }
    });

    socket.on('UPLOADING', data => {
        const curStat = fileMap.get(data.name);
        try {
            curStat.stream.write(data.data, 'binary');
            curStat.curSize = data.curSize;
            fileMap.set(data.name, curStat);
            logger.info(`${curStat.name} UPLOADED: ${curStat.curSize} из ${data.size}`);
            const progress = Math.round((100 * curStat.curSize) / data.size);
            socket.emit('PROGRESS', progress);
        } catch (err) {
            errorHandler(socket, fileMap, data, err);
        }
    });

    socket.on('UPLOAD_ABORTED', data => {
        try {
            const curStat = fileMap.get(data.name);
            curStat.stream.close();
            fileMap.delete(data.name);
        } catch (err) {
            errorHandler(socket, fileMap, data, err);
        }
    });

    socket.on('UPLOAD_FINISHED', data => {
        try {
            const curStat = fileMap.get(data.name);
            curStat.stream.close();
            fileMap.delete(data.name);
            unzipFiles(socket, data, curStat);
        } catch (err) {
            logger.error(`Ошибка при завершении загрузки архива с музыкой ${err.message}`);
            errorHandler(socket, fileMap, data, err);
        }
    });
});

const errorHandler = (socket, fileMap, data, err) => {
    const issueData = fileMap.get(data.name);
    if (_.has(issueData, 'stream')) {
        issueData.stream.close();
    }

    if (_.has(issueData, 'localPath')) {
        fs.unlink(issueData.localPath, err => {
            if (err) {
                logger.error(`Ошибка при удалении буферного архива. Ошибка: ${err.message}`);
            }
            logger.info('Успешное удаление буферного архива');
        });
    }
    if (_.has(err.message)) {
        err = err.message;
    }

    socket.emit('UPLOAD_ERROR', `При загрузке кастомного контента произошла ошибка: ${err}`);
};

const unzipFiles = (socket, data, curStat) => {
    const uploadedFiles = [];
    const localPathToReadZip = curStat.localPath;
    const newPath = data.name.replace('.zip', '');
    if (!fs.existsSync(localPathToReadZip.replace('.zip', ''))) {
        fs.mkdirSync(localPathToReadZip.replace('.zip', ''));
    }
    const localPathToExtractZip = TEST_DIR + '/' + curStat.path + '/' + newPath;
    const stream = fs.createReadStream(localPathToReadZip);
    stream.on('error', err => {
        const log = `Распаковка архива ${localPathToReadZip} завершена с ошибкой ${err.message}`;
        logger.info(log);
        return errorHandler(socket, fileMap, data, log);
    });
    stream
        .pipe(unzip.Parse())
        .on('entry', entry => {
            const fileName = entry.path;
            logger.info(`Успешно распакован файл ${fileName}`);
            if (fileName && fileName.match(/\.mp3|mp4|gif|png|jpeg|jpg|bmp/) !== null) {
                logger.info(`При распаковке ${fileName} будет загружен на диск`);
                const wrStream = fs.createWriteStream(localPathToExtractZip + '/' + fileName);
                wrStream.on('close', () => {
                    uploadedFiles.push({ file: fileName, success: true });
                });
                entry.pipe(wrStream);
            } else {
                logger.warn(`При распаковке файл ${fileName} не может быть загружен. Неизвестное расширение`);
                uploadedFiles.push({ file: fileName, success: false });
                entry.autodrain();
            }
        })
        .on('close', async () => {
            logger.info(`Распаковка архива ${localPathToReadZip} успешно завершена`);
            const unlinker = util.promisify(fs.unlink);

            unlinker(localPathToReadZip)
                .then(() => {
                    logger.info(`Успешное удаление буферного архива ${localPathToReadZip}`);
                })
                .catch(err => {
                    const log = `Ошибка при удалении буферного архива. Ошибка: ${err.message}`;
                    logger.error(log);
                    errorHandler(socket, fileMap, data, log);
                });

            socket.emit('UPLOAD_SUCCESS', uploadedFiles);

            const files = dirTree(localPathToExtractZip).children;

            try {
                const userId = await seq.users.find({
                    attributes: ['id'],
                    where: {
                        name: socket.ctx.sessionInfo,
                    },
                });

                const bulk = files.map(el => {
                    return {
                        name: el.name,
                        path: el.path,
                        uploader_id: userId.dataValues.id,
                    };
                });
                await seq.tracks.bulkCreate(bulk);
            } catch (err) {
                logger.error(`Ошибка при записи кастомного контента в бд ${err.message}`);
            }
        });
};

server.listen(port);
server.on('listening', () => {
    logger.info(`[SocketIO] Слушает на порту ${port}`);
});

server.on('error', err => {
    logger.error(`[SocketIO] Ошибка при запуске сервера на порту: ${port}, Ошибка: ${err.message}`);
});
