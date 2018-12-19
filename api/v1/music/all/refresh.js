
const _ = require('lodash');
const buildTree = require('../../../../helpers/buildTreeFromFileSystem').buildTree;


module.exports = async (data, ctx) => {
    const { logger, redis, seq, Seq } = ctx;
    try {
        logger.info(`Осуществляется считывание каталога файлов по адресу: ${process.env.CONTENT_PATH}`);
        const actualContent = [];
        let tree = await buildTree(process.env.CONTENT_PATH, el => {
            actualContent.push(el);
            return el
        });
        logger.info(`Cчитывание каталога файлов по адресу: ${process.env.CONTENT_PATH} прошло успешно`);
        tree.toggled = true;
        await updateContent(actualContent, ctx);
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
                // const isTypeAllowed = allowedMusicTypes.some(type => type ===  el.extension);
                // if (el.type === 'file' && isTypeAllowed) {
                //     pathArr.push(el.path);
                //     nameArr.push(el.name);
                // }
                pathArr.push(el.path);
                nameArr.push(el.name);
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
    const newFiles = actualContent.filter((el, j) => {
        const isNameFound = previusContent.some(el => el.name === previusContent[j].dataValues.name);
        const isPathFound = previusContent.some(el => el.path === previusContent[j].dataValues.path);
        if (!(isPathFound && isNameFound)) {
            return true;
        }
        return false;
    });

    const bulk = newFiles.map(el => {
        return {
            name: el.name,
            path: el.fullPath,
            parent: el.parentPath,
            depth: el.depth,
            uploader_id: 1
        }
    });
    logger.info(`Начинается обновление каталога файлов, количество новых фалов: ${bulk.length}`);
    await seq.models.tracks.bulkCreate(bulk);
};

