const buildTree = require('../../../../helpers/buildTreeFromFileSystem').buildTree;
const updateContent = require('services/musicService').updateContent;

module.exports = async (data, ctx) => {
    const { logger } = ctx;
    try {
        logger.info(`Осуществляется считывание каталога файлов по адресу: ${process.env.CONTENT_PATH}`);
        const actualContent = [];
        let tree = await buildTree(process.env.CONTENT_PATH, null, track => {
            actualContent.push(track);
            return track;
        });
        logger.info(`Cчитывание каталога файлов по адресу: ${process.env.CONTENT_PATH} прошло успешно`);
        tree.toggled = true;

        const normalizedActualContent = actualContent.map(el => {
            return {
                name: el.name,
                path: el.fullPath,
                parent: el.parentPath,
                depth: el.depth,
                isDirectory: el.isDirectory,
                userId: 1
            }
        });
        await updateContent(normalizedActualContent, ctx);

    } catch (err) {
        const log = `Произошла ошибка при считывании каталога файлов: ${err.message}`;
        logger.error(log);
        throw new Error(log);
    }
};