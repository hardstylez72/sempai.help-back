var express = require('express'); //Подключаем модуль express
var router = express.Router();    //Подключаем из модуля express объект Router
var {sequelize, Sequelize} = require('../init');
const _ = require('lodash');



router.post('/', async (req, res1) => {
    try {
        if ((_.get(req, 'body.data.descrVal', null)) || (_.get(req, 'body.data.urlValue', null))) {
            var dataFromDb = [];
            if ((req.body.data.descrVal !== 'data') && (req.body.data.urlValue !== 'give'))
                await sequelize.models.links.create({
                    user: 'hardstylez72',
                    descr: req.body.data.descrVal,
                    link: req.body.data.urlValue
                });
            dataFromDb = await sequelize.models.links.findAll();
    
            res1.send(JSON.stringify({sucsess: '1', articles: dataFromDb}));
        }
        else {
            console.log('Ошибка в формате данных');
            res1.send(JSON.stringify({sucsess: '0'}));
        }
    }
    catch(err){
        console.log(err);
        res1.send(JSON.stringify({sucsess: '0'}));
    }
   
});

module.exports = router; 