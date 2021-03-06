const _ = require('lodash');
const fs = require('fs');

module.exports = async (req, ctx) => {
    const { logger, } = ctx;

    try {
        const path = _.get(req, 'body.data');
        const jsonData = Buffer(path, 'base64').toString('utf-8');
        const data = JSON.parse(jsonData);

        if (!_.has(data, 'path')) {
            const log = `Неверные входные параметры: ${data}`;

            throw new Error(log);
        }
        const pathToFile = _.get(data, 'path', null);
        const lastChar = pathToFile.lastIndexOf('/');
        const pathWhithCover = pathToFile.slice(0, lastChar + 1);
        const files = await fs.readdirSync(pathWhithCover);

        const imgs = files.filter(el => {
            if (-1 !== el.indexOf('.png') || -1 !== el.indexOf('.jpeg') || -1 !== el.indexOf('.jpg') || -1 !== el.indexOf('.gif')) {
                return true;
            }

            return false;
        });

        if (0 === imgs.length) {
            return null;
        }

        let prefix = '';

        if (-1 !== imgs[0].indexOf('.png')) {
            prefix = 'png';
        }
        if (-1 !== imgs[0].indexOf('.jpeg')) {
            prefix = 'jpeg';
        }
        if (-1 !== imgs[0].indexOf('.jpg')) {
            prefix = 'jpg';
        }
        if (-1 !== imgs[0].indexOf('.gif')) {
            prefix = 'gif';
        }
        const img = pathWhithCover + imgs[0];
        let imgData = await fs.readFileSync(img, 'base64');

        imgData = `data:image/${prefix};base64,` + imgData;

        logger.info('Успешно считано файлов favorite из БД');

        return imgData;
    } catch (err) {
        const log = `Произошла ошибка при считывании каталога файлов favorite: ${err.message}`;

        logger.error(log);
        throw new Error(log);
    }
};
