var express = require('express'); //Подключаем модуль express
var router = express.Router();    //Подключаем из модуля express объект Router
var {sequelize, Sequelize} = require('../init');
const Op = Sequelize.Op;
const _ = require('lodash');


//Функция добавляет новую запись
router.put('/favorite/',  async (req, res) => {
    try {
        const track = _.get(req, 'body.track', false);
        if (track) {
            const trackId = await sequelize.models.tracks.find({
                attributes: ['id'],
                where: {
                    name: track,
                }
            });
            const userId = await sequelize.models.users.find({
                attributes: ['id'],
                where: {
                    name: req.sessionInfo,
                }
            });

            const result = await sequelize.models.tastes.findOrCreate({
                where: {
                    track_id: trackId.dataValues.id,
                    user_id: userId.dataValues.id
                },
                defaults: {
                    deleted: false,
                    track_id: trackId.dataValues.id,
                    user_id: userId.dataValues.id
                }
            });
            if (result) {
                return res.send(JSON.stringify({success: '1'}));
            }
        } else {
            console.log('Ошибка в формате данных');
            return res.send(JSON.stringify({success: '0'}));
        }
    } catch(err) {
        console.log(err);
        return res.send(JSON.stringify({success: '0'}));
    }
});


//Функция добавляет новую запись
router.post('/favorite/',  async (req, res) => {
    try {
        const track = _.get(req, 'body.track', false);
        if (track) {
            const trackId = await sequelize.models.tracks.find({
                attributes: ['id'],
                where: {
                    name: track,
                }
            });
            const userId = await sequelize.models.users.find({
                attributes: ['id'],
                where: {
                    name: req.sessionInfo,
                }
            });
            if (trackId && userId) {
                const result = await sequelize.models.tastes.findOne({
                    where: {
                        deleted: false,
                        track_id: trackId.dataValues.id,
                        user_id: userId.dataValues.id
                    }
                });
                if (result) {
                    return res.send(JSON.stringify({success: '1', included: true}));
                }
                return res.send(JSON.stringify({success: '1', included: false}));
            }
            return res.send(JSON.stringify({success: '1', included: false}));
        } else {
            console.log('Ошибка в формате данных');
            return res.send(JSON.stringify({success: '0'}));
        }
    } catch(err) {
        console.log(err);
        return res.send(JSON.stringify({success: '0'}));
    }
});


router.delete('/favorite/',  async (req, res) => {
    try {
        const track = _.get(req, 'body.track', false);
        if (track) {
            const trackId = await sequelize.models.tracks.find({
                attributes: ['id'],
                where: {
                    name: track,
                }
            });
            const userId = await sequelize.models.users.find({
                attributes: ['id'],
                where: {
                    name: req.sessionInfo,
                }
            });
            if (trackId && userId) {
                const result = await sequelize.models.tastes.update(
                    {
                        deleted: true,
                        rack_id: trackId.dataValues.id,
                        user_id: userId.dataValues.id,
                    }, {
                        where: {
                            deleted: false,
                            track_id: trackId.dataValues.id,
                            user_id: userId.dataValues.id
                        }
                    }
                );
                if (result) {
                    return res.send(JSON.stringify({success: '1', included: true}));
                }
                return res.send(JSON.stringify({success: '1', included: false}));
            }
            return res.send(JSON.stringify({success: '1', included: false}));
        } else {
            console.log('Ошибка в формате данных');
            return res.send(JSON.stringify({success: '0'}));
        }
    } catch(err) {
        console.log(err);
        return res.send(JSON.stringify({success: '0'}));
    }
});





module.exports = router;
