var express = require('express'); //Подключаем модуль express
var router = express.Router();    //Подключаем из модуля express объект Router
var {sequelize, Sequelize} = require('../init');
const Op = Sequelize.Op;
const _ = require('lodash');


//Функция добавляет новую запись
router.put('/',  async (req, res) => {
    try {
        if (_.has(req, 'body.data.descr') && 
            _.has(req, 'body.data.url') &&
            _.has(req, 'body.data.abstract') &&
            _.has(req, 'body.data.user')) {
                await sequelize.models.links.create({
                    user: req.body.data.user,
                    descr: req.body.data.descr,
                    link: req.body.data.url,
                    abstract: req.body.data.abstract
                });
            res.send(JSON.stringify({success: '1'}));
        } else {
            console.log('Ошибка в формате данных');
            res.send(JSON.stringify({success: '0'}));
        }
    } catch(err) {
        console.log(err);
        res.send(JSON.stringify({success: '0'}));
    }
});

//Функция возвращает записи 
router.post('/',  async (req, res) => {
    try {
        if (_.has(req, 'body.data.amount') && 
            _.has(req, 'body.data.offset')) {
                //todo: доделать обработку фильтра
            const dataFromDb = await sequelize.models.links.findAll();
            res.send(JSON.stringify({success: '1', data: dataFromDb}));
        } else {
            console.log('Ошибка в формате данных');
            res.send(JSON.stringify({success: '0'}));
        }
    } catch(err) {
        console.log(err);
        res.send(JSON.stringify({success: '0'}));
    }
});



router.delete('/',  async (req, res) => {
    try {
        if (_.has(req, 'body.data.id')) {
                await sequelize.models.links.update({
                    deleted: true,

                }, {
                    where: {
                        key : {
                            [Op.eq]: req.body.data.id
                        }
                    }
                })
            res.send(JSON.stringify({success: '1'}));
        } else {
            console.log('Ошибка в формате данных');
            res.send(JSON.stringify({success: '0'}));
        }
    } catch(err){
        console.log(err);
        res.send(JSON.stringify({success: '0'}));
    }
});

router.patch('/',  async (req, res) => { //todo доделать
    try {
        if (_.has(req, 'body.data.id')) {

                const bozdo = await sequelize.models.links.findByPrimary(req.body.data.id);
                await sequelize.models.links.update({
                    deleted: true,

                }, {
                    where: {
                        key : {
                            [Op.eq]: req.body.data.id
                        }
                    }
                })
            res.send(JSON.stringify({success: '1'}));
        } else {
            console.log('Ошибка в формате данных');
            res.send(JSON.stringify({success: '0'}));
        }
    } catch(err){
        console.log(err);
        res.send(JSON.stringify({success: '0'}));
    }
});


module.exports = router; 
