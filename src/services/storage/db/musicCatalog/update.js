module.exports = async (actualContent, ctx) => {
    const { logger, db } = ctx;
    logger.info(`Начинается обновление каталога файлов, количество новых фалов: ${actualContent.length}`);

    const content = JSON.stringify(actualContent);
    await db.query('select tracks.get_music_catalog_list($1);', [content]);
};
