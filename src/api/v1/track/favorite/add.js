const _ = require('lodash');

module.exports = async (req, ctx) => {
    const { logger, seq, Seq, mark } = ctx;
    try {
        const track = _.get(req, 'body.data', false);
        logger.info(`Проверка трека: ${track} на принадлежность к избранному пользователя ${mark.sessionInfo}`);
        if (!track) throw new Error('Входные данные некорректны');

        const trackId = await seq.models.tracks.find({
            attributes: ['id'],
            where: {
                name: track,
            },
        });
        const userId = await seq.models.users.find({
            attributes: ['id'],
            where: {
                login: mark.sessionInfo,
            },
        });
        if (!(trackId && userId)) return { included: false };

        const result = await seq.models.tastes.findOrCreate({
            where: {
                track_id: trackId.dataValues.id,
                user_id: userId.dataValues.id,
            },
            defaults: {
                deleted: false,
                track_id: trackId.dataValues.id,
                user_id: userId.dataValues.id,
            },
        });
        if (!result) return { included: false };

        logger.info('Успешно считано файлов favorite из БД');
        return { included: false };
    } catch (err) {
        const log = `Произошла ошибка при считывании каталога файлов favorite: ${err.message}`;
        logger.error(log);
        throw new Error(log);
    }
};
