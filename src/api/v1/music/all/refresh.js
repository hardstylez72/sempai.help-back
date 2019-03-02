const { buildTree, } = require('../../../../helpers/buildTreeFromFileSystem');

module.exports = async (data, ctx) => {
    const { logger, storage, } = ctx;
    const { update, } = storage.db.musicCatalog;

    try {
        logger.info(`Осуществляется считывание каталога файлов по адресу: ${process.env.CONTENT_PATH}`);
        const actualContent = [];
        const tree = await buildTree(process.env.CONTENT_PATH, null, track => {
            actualContent.push(track);

            return track;
        });

        logger.info(`Cчитывание каталога файлов по адресу: ${process.env.CONTENT_PATH} прошло успешно`);
        tree.toggled = true;

        const normalizedActualContent = actualContent.map(el => ({
            name       : el.name,
            path       : el.fullPath,
            parent     : el.parentPath,
            depth      : el.depth,
            isDirectory: el.isDirectory,
            userId     : 1,
        }));

        await update(normalizedActualContent, ctx);
    } catch (err) {
        const log = `Произошла ошибка при считывании каталога файлов: ${err.message}`;

        logger.error(log);
        throw new Error(log);
    }
};
