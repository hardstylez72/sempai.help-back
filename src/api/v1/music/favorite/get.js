
module.exports = async (files, ctx) => {
    return [];
    const { logger, db, mark, } = ctx;

    try {
        logger.info('Считывание каталога файлов favorite из БД');
        const result = await db.query(`
        select 
            t."name"
          , t."path" 
        from content.tracks t
          join tastes.tastes on tastes.tastes.track_id = t.id
          join users.users on users.users.id = tastes.tastes.user_id
          where users.users."login" = $1 and tastes.tastes.deleted <> true
            `, [mark.sessionInfo, ]);

        logger.info(`Успешно считано ${result.length} файлов favorite из БД`);

        return result;
    } catch (err) {
        const log = `Произошла ошибка при считывании каталога файлов favorite: ${err.message}`;

        logger.error(log);
        throw new Error(log);
    }
};
