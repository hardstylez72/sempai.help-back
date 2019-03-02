const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const ROOT_PATH = process.env.CONTENT_PATH;
const util = require('util');
const unzip = require('unzip');
const unlink = util.promisify(fs.unlink);
const appendFile = util.promisify(fs.appendFile);
const remove = util.promisify(fsExtra.remove);

const store = new Map();
let isCollectorRunnging = false;

const autoFileGarbageCollector = (store, ctx) => {
    const { moment, _, } = ctx.libs;
    const id = setInterval(() => {
        let count = 0;

        try {
            store.forEach((val, key, map) => {
                count++;
                const now = new moment();
                const startTime = _.get(val, 'startTime', false);

                if (!startTime) {
                    return;
                }

                const diff = moment.duration(now.diff(startTime)).asMinutes();

                if (diff.toString() > process.env.MAX_UPLOAD_TIME_IN_MINUTES) {
                    deleteFile(val.pathToSaveZip, ctx);
                    remove(val.pathToSaveZip.replace('.zip', ''))['catch'](console.log);
                    store['delete'](key);
                }
            });
            if (0 === count) {
                clearInterval(id);
                isCollectorRunnging = false;
            }
        } catch (e) {
            console.log(e);
        }
    }, 1000);
};

module.exports = async (req, ctx) => {
    if (!isCollectorRunnging) {
        isCollectorRunnging = true;
        autoFileGarbageCollector(store, ctx);
    }

    const { logger, libs, } = ctx;
    const { _, } = libs;
    const data = req.body;
    let fileInfo = store.get(data.name);
    const isFirstChunk = !fileInfo;

    if ('ABORT' === _.get(data, 'data.cmd', null)) {
        if (store.get(data.data.name)) {
            store.set(data.data.name, {
                isAborted: true,
                ...store.get(data.data.name),
            });
        }

        return;
    }

    const file = req.files[0];

    let progress = 0;

    try {
        if (isFirstChunk) {
            if (!isValid(data)) {
                throw new Error('Ошибка при загрузке файлов');
            }

            prepareFirstChunk(data, file, ctx);
            fileInfo = store.get(data.name);
            progress = 0;
        }

        const isAborted = await processChunk(data, file, ctx);

        if (isAborted) {
            return { isAborted: true, };
        }

        if (Number(data.curSize) >= Number(data.size)) {
            //  Logger.info(`Заканчивается загрузка файла ${data.name} размером ${data.size}`);
            const fileList = await processLastChunk(data, file, ctx);

            progress = Math.round((100 * fileInfo.curSize) / fileInfo.size);

            return {
                progress,
                fileList,
            };
        }

        if (fileInfo) {
            progress = Math.round((100 * fileInfo.curSize) / fileInfo.size);
        }

        return {
            progress,
            fileList: [],
        };
    } catch (err) {
        logger.error(err);
        throw err;
    }
};

const isValid = body => {
    const data = body;

    if (-1 === data.name.indexOf('.zip')) {
        return false;
    }

    if (store.get(data.name)) {
        return false;
    }

    return true;
};

const prepareFirstChunk = (body, file, ctx) => {
    const { moment, } = ctx.libs;
    const data = body;
    const pathToSaveZip = path.join(ROOT_PATH, data.path, data.name);

    const fileInfo = {
        size     : data.size,
        curSize  : 0,
        pathToSaveZip,
        name     : data.name,
        startTime: new moment(),
    };

    store.set(fileInfo.name, fileInfo);
};

const processChunk = async (body, file, ctx) => {
    const { logger, } = ctx;
    const data = body;
    const fileInfo = store.get(data.name);
    const fileData = file.buffer;

    await appendFile(fileInfo.pathToSaveZip, fileData, { encoding: 'binary', });

    fileInfo.curSize = data.curSize;

    const newFileInfo = store.get(data.name);

    if (newFileInfo.isAborted) {
        await deleteFile(fileInfo.pathToSaveZip, ctx);
        await remove(fileInfo.pathToSaveZip.replace('.zip', ''))['catch'](logger.error);
        store['delete'](newFileInfo.name);

        return { isAborted: true, };
    }

    store.set(data.name, fileInfo);
};

const deleteFile = async (name, ctx) => {
    const { logger, } = ctx;

    await unlink(name)
        .then(async () => {
            logger.info(`Успешное удаление буферного архива ${name}`);
        })
        .catch(async err => {
            const log = `Ошибка при удалении буферного архива. Ошибка: ${err}`;

            logger.error(log);
        });
};
const processLastChunk = async (body, file, ctx) => {
    const { logger, storage, } = ctx;
    const { update, } = storage.db.musicCatalog;
    const data = body;

    const fileInfo = store.get(data.name);
    const result = await unzipFiles(fileInfo, ctx)['catch'](async err => {
        logger.error(err);
        await deleteFile(fileInfo.pathToSaveZip, ctx);
        await remove(fileInfo.pathToSaveZip.replace('.zip', ''))['catch'](logger.error);
        throw err;
    });
    const newFileInfo = store.get(data.name);

    const anyNewFiles = result.files.some(el => el.success);

    if (!anyNewFiles || newFileInfo.isAborted) {
        await remove(fileInfo.pathToSaveZip.replace('.zip', ''))['catch'](logger.error);
    }

    await deleteFile(fileInfo.pathToSaveZip, ctx);

    store['delete'](data.name);

    try {
        const parentPath = result.path.slice(0, result.path.lastIndexOf('/'));
        const actualContent = result.files
            .map(el => {
                if (el.success) {
                    return {
                        name       : el.file,
                        path       : result.path.replace('.zip', `/${el.file}`),
                        parent     : parentPath,
                        depth      : 3,
                        isDirectory: false,
                        userId     : ctx.mark.user.id,
                    };
                }
            })
            .filter(el => el !== undefined);

        actualContent.push({
            name       : result.path.replace('.zip', '').slice(result.path.lastIndexOf('/') + 1, result.path.length),
            path       : result.path.replace('.zip', ''),
            parent     : parentPath,
            depth      : 3,
            isDirectory: true,
            userId     : ctx.mark.user.id,
        });

        await update(actualContent, ctx);
    } catch (e) {
        await deleteFile(fileInfo.pathToSaveZip, ctx);
        await remove(fileInfo.pathToSaveZip.replace('.zip', ''))['catch'](logger.error);
        throw e;
    }

    return result.files;
};

const unzipFiles = async (data, ctx) => {
    const { logger, } = ctx;

    return new Promise((resolve, reject) => {
        const uploadedFiles = [];
        const localPathToReadZip = data.pathToSaveZip;
        const newPath = localPathToReadZip.replace('.zip', '');

        if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath);
        }

        const localPathToExtractZip = localPathToReadZip.replace('.zip', '');
        const stream = fs.createReadStream(localPathToReadZip);

        stream.on('error', err => {
            const log = `Распаковка архива ${localPathToReadZip} завершена с ошибкой ${err.message}`;

            logger.error(log);
            reject(err);
        });

        stream
            .pipe(unzip.Parse().on('error', err => {
                const log = `Распаковка архива ${localPathToReadZip} завершена с ошибкой ${err.message}`;

                logger.error(log);
                reject(err);
            }))
            .on('entry', entry => {
                const fileName = entry.path;

                logger.info(`Успешно распакован файл ${fileName}`);
                if (fileName && null !== fileName.match(/\.mp3|mp4|gif|png|jpeg|jpg|bmp/)) {
                    logger.info(`При распаковке ${fileName} будет загружен на диск`);
                    const wrStream = fs.createWriteStream(localPathToExtractZip + '/' + fileName);

                    wrStream.on('close', () => {
                        uploadedFiles.push({
                            file   : fileName,
                            success: true,
                        });
                    });
                    wrStream.on('error', err => {
                        reject(err);
                    });
                    entry.pipe(wrStream);
                } else {
                    logger.warn(`При распаковке файл ${fileName} не может быть загружен. Неизвестное расширение`);
                    uploadedFiles.push({
                        file   : fileName,
                        success: false,
                    });
                    entry.autodrain();
                }
            })
            .on('close', () => {
                logger.info(`Распаковка архива ${localPathToReadZip} успешно завершена`);
                resolve({
                    path : localPathToReadZip,
                    files: uploadedFiles,
                });
            })
            .on('error', err => {
                logger.info(`Ошибка при распаковке архива ${err.message}`);
                reject({
                    path : null,
                    files: null,
                });
            });
    });
};
