const fs = require('fs');
const path = require('path');
const ROOT_PATH = process.env.CONTENT_PATH;
const util = require('util');
const unzip = require('unzip');
const unlink = util.promisify(fs.unlink);
const readFile = util.promisify(fs.readFile);
const appendFile = util.promisify(fs.appendFile);
const remove = util.promisify(fs.rmdir);

const store = new Map();

module.exports = async (req, ctx) => {

    const { logger } = ctx;
    const data = req.body;
    const file = req.files.data;

    let fileInfo = store.get(data.name);
    let progress = 0;

    try {

        // Если файл не существует
        if (!fileInfo) {
            if (!isValid(data)) {
                return []
            }
            //   logger.info(`Начинается загрузка файла ${data.name} размером ${data.size}`);

            prepareFirstChunk(data, file);
            fileInfo = store.get(data.name);
            progress = 0;
        }

        await processChunk(data, file);

        if (Number(data.curSize) >= Number(data.size)) {
            //  logger.info(`Заканчивается загрузка файла ${data.name} размером ${data.size}`);
            const fileList = await processLastChunk(data, file, ctx);
            progress = Math.round(100*fileInfo.curSize/fileInfo.size);
            return {progress: progress, fileList: fileList};
        }

        if (fileInfo) {
            progress = Math.round(100*fileInfo.curSize/fileInfo.size);
        }

    } catch(err) {
        logger.error(err.message)
    }

    return {progress: progress, fileList: []};
};




const isValid = body => {
    const data = body;
    if (data.name.indexOf('.zip') === -1) {
        return false;
    }

    if (store.get(data.name)) {
        return false;
    }

    return true;
};

const prepareFirstChunk = (body, file) => {
    const data = body;

    const pathToSaveZip = path.join(ROOT_PATH, data.path, data.name);

    const fileInfo = {
        size: data.size,
        curSize: 0,
        pathToSaveZip: pathToSaveZip,
        name: data.name
    };
    store.set(fileInfo.name, fileInfo)
};

const processChunk = async (body, file) => {

    const data = body;
    const fileInfo = store.get(data.name);

    const fileData = await readFile(file.path, {encoding: 'binary'});
    await unlink(file.path);
    await appendFile(fileInfo.pathToSaveZip, fileData, {encoding: 'binary'});

    fileInfo.curSize = data.curSize;
    store.set(data.name, fileInfo);
};

const processLastChunk = async (body, file, ctx) => {
    const { logger } = ctx;
    const data = body;

    const fileInfo = store.get(data.name);
    const result = await unzipFiles(fileInfo, ctx).catch()
    const anyNewFiles = result.files.some(el => el.success);
    if (!anyNewFiles) {
        await remove(result.path.replace('.zip', ''))
            .then(() => {
                logger.info(`Успешное удаление ${localPathToReadZip.replace('.zip', '')}`);
                return Promise.resolve()
            })
            .catch(err => {
                const log = `Ошибка при удалении пустой папки. Ошибка: ${err.message}`;
                logger.error(log);
                return Promise.resolve()
            });
    }

    await unlink(result.path)
        .then(() => {
            logger.info(`Успешное удаление буферного архива ${result.path}`);
            return Promise.resolve()
        })
        .catch(err => {
            const log = `Ошибка при удалении буферного архива. Ошибка: ${err.message}`;
            logger.error(log);
            return Promise.resolve()
        });

    store.delete(data.name);
    return Promise.resolve(result.files)
};


const unzipFiles = async (data, ctx) => {
    const { logger } = ctx;
    return new Promise((resolve, reject) => {
        const uploadedFiles = [];
        const localPathToReadZip = data.pathToSaveZip;
        const newPath = localPathToReadZip.replace('.zip', '');
        if ( !fs.existsSync(newPath) ) {
            fs.mkdirSync(newPath);
        }
        const localPathToExtractZip = localPathToReadZip.replace('.zip', '');
        const stream = fs.createReadStream(localPathToReadZip);
        stream.on('error', (err) => {
            const log = `Распаковка архива ${localPathToReadZip} завершена с ошибкой ${err.message}`;
            logger.error(log);
            reject({path: null, files: null})
        });

        stream.pipe(unzip.Parse()
            .on('error', (err) => {
                const log = `Распаковка архива ${localPathToReadZip} завершена с ошибкой ${err.message}`;
                logger.error(log);
                reject({path: null, files: null})
            })
        )
            .on('entry', (entry) => {
                const fileName = entry.path;
                logger.info(`Успешно распакован файл ${fileName}`);
                if (fileName && fileName.match(/\.mp3|mp4|gif|png|jpeg|jpg|bmp/) !== null) {
                    logger.info(`При распаковке ${fileName} будет загружен на диск`);
                    const wrStream = fs.createWriteStream(localPathToExtractZip + '/' + fileName);
                    wrStream.on('close', () => {
                        uploadedFiles.push({file: fileName, success: true});
                    });
					wrStream.on('error', (err) => {
						reject({path: null, files: null})
                    });
                    entry.pipe(wrStream);
                } else {
                    logger.warn(`При распаковке файл ${fileName} не может быть загружен. Неизвестное расширение`);
                    uploadedFiles.push({file: fileName, success: false});
                    entry.autodrain();
                }
            })
            .on('close', () => {
                logger.info(`Распаковка архива ${localPathToReadZip} успешно завершена`);
                resolve({path: localPathToReadZip, files: uploadedFiles})
            })
            .on('error', (err) => {
                logger.info(`Ошибка при распаковке архива ${err.message}`);
                reject({path: null, files: null})
            })
    })
};







//  socket.emit('UPLOAD_SUCCESS', uploadedFiles); todo

// const files = dirTree(localPathToExtractZip).children;
//
// try {
//     const userId = await seq.users.find({
//         attributes: ['id'],
//         where: {
//             name: socket.ctx.sessionInfo,
//         }
//     });
//
//     const bulk = files.map(el => {
//         return {
//             name: el.name,
//             path: el.path,
//             uploader_id: userId.dataValues.id
//         }
//     });
//     await seq.tracks.bulkCreate(bulk);

// } catch (err) {
//     logger.error(`Ошибка при записи кастомного контента в бд ${err.message}`)
// }