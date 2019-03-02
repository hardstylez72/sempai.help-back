
module.exports = async (data, ctx) => {
    const { logger, seq, Seq, mark, } = ctx;

    try {
        logger.info('Считывание каталога файлов favorite из БД');
        const result = await seq.query(
            `
        select 
            tracks.tracks."name"
            ,tracks.tracks."path"
        from tracks.tracks
          join tastes.tastes on tastes.tastes.track_id = tracks.tracks.id
          join users.users on users.users.id = tastes.tastes.user_id
          where users.users."login" = '${mark.sessionInfo}' and tastes.tastes.deleted <> true
            `,
            { type: Seq.QueryTypes.SELECT, }
        );

        logger.info(`Успешно считано ${result.length} файлов favorite из БД`);

        return result;
    } catch (err) {
        const log = `Произошла ошибка при считывании каталога файлов favorite: ${err.message}`;

        logger.error(log);
        throw new Error(log);
    }
};
