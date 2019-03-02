const _ = require('lodash');

module.exports = async (data, ctx) => {
    const { logger, seq, mark, } = ctx;

    try {
        logger.info('Считывание каталога файлов upload из БД');

        const userId = await seq.models.users.find({
            attributes: ['id', ],
            where     : { name: mark.sessionInfo, },
        });

        if (userId) {
            const result = await seq.models.tracks.findAll({
                where: {
                    deleted    : false,
                    uploader_id: userId.dataValues.id,
                },
            });

            logger.info(`Успешно считано ${result.length} файлов upload из БД`);

            return result;
        }

        return [];
    } catch (err) {
        const log = `Произошла ошибка при считывании каталога файлов upload: ${err.message}`;

        logger.error(log);
        throw new Error(log);
    }
};
