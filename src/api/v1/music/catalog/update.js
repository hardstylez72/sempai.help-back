const { buildTree, } = require('../../../../helpers/buildTreeFromFileSystem');

module.exports = async req => {
    const {ctx} = req;
    const { logger, storage, config, } = ctx;
    const { update, } = storage.db.musicCatalog;

    try {
        logger.info('Осуществляется считывание каталога файлов по адресу');
        const actualContent = [];
        const tree = await buildTree(config.contentPath, null, track => {
            actualContent.push(track);

            return track;
        });

        logger.info('Cчитывание каталога файлов по адресу прошло успешно');
        tree.toggled = true;

        const normalizedActualContent = actualContent.map(file => ({
            name       : file.name,
            path       : file.fullPath,
            parent     : file.parentPath,
            depth      : file.depth,
            isDirectory: file.isDirectory,
            userId     : 1,
        }));

        await update(normalizedActualContent, ctx);
    } catch (err) {
        const log = `Произошла ошибка при считывании каталога файлов: ${err.message}`;

        logger.error(log);
        throw new Error(log);
    }
};
