var express = require('express'); //Подключаем модуль express
var router = express.Router();    //Подключаем из модуля express объект Router
var {sequelize, Sequelize} = require('../init');



router.post('/', async (req, res1) => {
    try {
        if ((req.body.data.descrVal) || (req.body.data.urlValue)) {
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
    }
   
});

module.exports = router; 