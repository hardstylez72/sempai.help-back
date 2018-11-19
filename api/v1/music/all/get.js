
const dirTree = require('directory-tree');
const _ = require('lodash');


const allowedMusicTypes = ['.mp3', '.flac'];

module.exports = async (data, ctx) => {
    const { logger, redis, seq, Seq } = ctx;
    try {
        let tree = {};
        const content = await redis.get(process.env.CONTENT_PATH);
        if (content !== null) {
            tree = JSON.parse(content);
            return tree;
        }
            logger.info(`Осуществляется считывание каталога файлов по адресу: ${process.env.CONTENT_PATH}`);
            tree = dirTree(process.env.CONTENT_PATH, {extensions:/\.mp3|\.flac/});
            logger.info(`Cчитывание каталога файлов по адресу: ${process.env.CONTENT_PATH} прошло успешно`);
            tree.toggled = true;
            //const actualContent = await getContentArray(tree);
            //await updateContent(actualContent, ctx); //todo: сделать принудительный апдейт
            await redis.set(process.env.CONTENT_PATH, JSON.stringify(tree), 'EX', process.env.REDIS_CONTENT_UPDATE_TIME);
            return tree;

    } catch (err) {
        logger.error(`Произошла ошибка при считывании каталога файлов: ${err.message}`);
        throw err;
    }
};

const getContentArray = async (baseFolderStruct) => {
    if (!baseFolderStruct) {
        throw new Error('Парсинг каталога файлов: Ошибка: пустой объект')
    }
    const pathArr = [];
    const nameArr = [];
    (function searchInTree(node) {
        if (node.children) {
            for (let index = 0; index < node.children.length; index++) {
                let el = node.children[index];
                const isTypeAllowed = allowedMusicTypes.some(type => type ===  el.extension);
                if (el.type === 'file' && isTypeAllowed) {
                    pathArr.push(el.path);
                    nameArr.push(el.name);
                }
                searchInTree(el);
            }
        }
    })(baseFolderStruct);
    return Promise.resolve({pathArr: pathArr, nameArr: nameArr});
};

const updateContent = async (actualContent, ctx) => {
    const { logger, seq } = ctx;

    logger.info(`Считывание всех треков`);
    const previusContent = await seq.models.tracks.findAll();
    logger.info(`Считывание ${previusContent.length} треков прошло успешно`);
    const newFiles = previusContent.filter((el, j) => {
        const isNameFound = previusContent.some(el => actualContent.nameArr[j] === el.dataValues.name);
        const isPathFound = previusContent.some(el => actualContent.nameArr[j] === el.dataValues.name);
        if (!(isPathFound && isNameFound)) {
            return false;
        }
        return true;
    });

    const bulk = newFiles.map(el => {
        return {
            name: el.name,
            path: el.path,
            uploader_id: 1
        }
    });
    logger.info(`Начинается обновление каталога файлов, количество новых фалов: ${bulk.length}`);
    await seq.models.tracks.bulkCreate(bulk);
};

