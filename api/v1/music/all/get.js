
const dirTree = require('directory-tree');
const _ = require('lodash');
const buildTree = require('../../../../helpers/buildTreeFromFileSystem').buildTree;


const allowedMusicTypes = ['.mp3', '.flac'];

module.exports = async (data, ctx) => {
    const { logger, redis, seq, Seq } = ctx;
    try {
        const res = await seq.models.tracks.findAll({
            where: {
                parent: data.body.data
            }
        });
        let tree = {};
        const content = await redis.get(process.env.CONTENT_PATH);
        if (content !== null) {
            tree = JSON.parse(content);
            return tree;
        }
            logger.info(`Осуществляется считывание каталога файлов по адресу: ${process.env.CONTENT_PATH}`);
            //tree1 = dirTree(process.env.CONTENT_PATH);
            const actualContent = [];
            tree = await buildTree(process.env.CONTENT_PATH, el => {
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

const updateContent = async (actualContent, ctx) => {
    const { logger, seq } = ctx;

    logger.info(`Считывание всех треков`);
    const previusContent = await seq.models.tracks.findAll();
    logger.info(`Считывание ${previusContent.length} треков прошло успешно`);
    const newFiles = actualContent.filter((el, j) => {
        const isNameFound = previusContent.some(el => el.dataValues.name === actualContent[j].name);
        const isPathFound = previusContent.some(el => el.dataValues.path === actualContent[j].path);
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
            isDirectory: el.isDirectory,
            uploader_id: 1
        }
    });
    logger.info(`Начинается обновление каталога файлов, количество новых фалов: ${bulk.length}`);
    await seq.models.tracks.bulkCreate(bulk);
};

