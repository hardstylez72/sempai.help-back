var express = require('express'); //Подключаем модуль express
var router = express.Router(); //Подключаем из модуля express объект Router
const _ = require('lodash');

router.post('/', async (req, res) => {
    const { seq, Seq, logger } = req.ctx;
    try {
        const userId = await seq.models.users.find({
            attributes: ['id'],
            where: {
                name: req.sessionInfo,
            },
        });
        if (userId) {
            const result = await seq.models.tracks.findAll({
                where: {
                    deleted: false,
                    uploader_id: userId.dataValues.id,
                },
            });
            if (result) {
                return res.send(JSON.stringify({ success: '1', data: result }));
            }
            return res.send(JSON.stringify({ success: '1', data: [] }));
        }
        return res.send(JSON.stringify({ success: '0', data: [] }));
    } catch (err) {
        logger.error(err.message);
        return res.send(JSON.stringify({ success: '0' }));
    }
});

module.exports = router;
