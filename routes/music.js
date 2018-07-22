var express = require('express');
var router = express.Router();
const dirTree = require('directory-tree');


//Функция возвращает записи 
router.post('/',  async (req, res) => {
    try {
        const tree = dirTree('/media/hardstylez72/Новый том/music/');
        res.send(JSON.stringify({sucsess: '1', data: tree}));
    } catch(err) {
        console.log(err);
        res.send(JSON.stringify({sucsess: '0'}));
    }
});

module.exports = router;
