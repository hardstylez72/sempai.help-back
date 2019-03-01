var express = require('express');
var router = express.Router();
const crypto = require('crypto');
var fs = require('fs');
var path = require('path');
const fileDir = __dirname + '/';

var responce = {
    data: '',
    status: '',
};

function resHandler(err, res) {
    responce.status = 'Изображение успешно загружено';
    if (err) {
        console.log(err + __filename);
        responce.status = err;
    }
    res.json(JSON.stringify(responce));
}

router.post('/', function(req, res) {
    if (req.body.imgSrc !== undefined && req.body.imgType !== undefined) {
        var base64Data = req.body.imgSrc;
        var type = req.body.imgType;
        var hash = crypto
            .createHash('md5')
            .update(base64Data)
            .digest('hex');
        console.log(hash);
        getFilesWithProps(fileDir, type, (err, files) => {
            if (err) resHandler(err, res);
            else
                isImgAlreadyExist(fileDir, files, hash, (err, result) => {
                    if (err) resHandler(err, res);
                    else if (result) resHandler(null, res);
                    else
                        writeNewImg(fileDir, type, base64Data, err => {
                            if (err) resHandler(err, res);
                            else resHandler(null, res);
                        });
                });
        });
    } else res.json(JSON.stringify({ answ: 'err' }));
});

module.exports = router;

function writeNewImg(path, type, file, cb) {
    var nowDate = new Date();
    var date = nowDate.getTime();
    fs.writeFile(path + date + '.' + type, file, 'base64', err => {
        if (err) cb(err);
        else cb(null);
    });
}

function isImgAlreadyExist(path, files, hash, cb) {
    let i = 0;
    if (files.length === 0) return cb(null, false);

    fs.readFile(path + files[i], 'base64', isImgAlreadyExistCallBack);
    function isImgAlreadyExistCallBack(err, data) {
        if (err) cb(err, false);
        else {
            if (i === files.length) return cb(null, false);
            i++;
            let hashBuffer = crypto
                .createHash('md5')
                .update(data)
                .digest('hex');
            if (hashBuffer === hash) return cb(null, true);
            return fs.readFile(path + files[i], 'base64', isImgAlreadyExistCallBack);
        }
    }
}

function getFilesWithProps(path, type, cb) {
    if (path == undefined || type == undefined || cb == undefined) return cb('Input params are not valid', null);
    fs.readdir(path, (err, files) => {
        if (err) return cb(err, null);

        var filesFound = files.filter(file => {
            if (file.search(RegExp('.' + type)) !== -1) return file;
            else if (type === 'jpeg')
                if (file.search(RegExp('.jpg')) !== -1) return file;
                else if (type === 'jpg') if (file.search(RegExp('.jpeg')) !== -1) return file;
        });
        return cb(null, filesFound);
    });
}
