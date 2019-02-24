const _ = require('lodash');
const fs = require('fs');

module.exports = async (req, res, ctx) => {
    const { logger } = ctx;
    try {

        const jsonData = Buffer(req.params.data, 'base64').toString('utf-8');
        const data = JSON.parse(jsonData);
        if (!_.has(data, 'path')) {
            return null;
        }
        
        const pathToFile = _.get(data, 'path', null);
        const isPathExist = await fs.existsSync(pathToFile);
        
        if (!isPathExist) {
            return null;
        }
        
        const stat = fs.statSync(pathToFile);
        const path = pathToFile;
        const fileSize = stat.size;
        const range = req.headers.range;
        
        if (range) { //todo нужно завести таймаут на закрытие стрима
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;
            const file = fs.createReadStream(path, {start, end});
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-type': 'audio/*'
            };
            res.writeHead(206, head);
            file.pipe(res);

        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-type': 'audio/*'
            };
            res.writeHead(200, head);
            fs.createReadStream(path).pipe(res);
        }


    } catch (err) {
        const log = `Произошла ошибка при считывании каталога файлов favorite: ${err.message}`;
        logger.error(log);
        throw new Error(log);
    }
};