const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');
const unzip = require('unzip');
const _ = require('lodash');


const port = 4001;
const app = express();
const server = http.createServer(app);
const fileMap = new Map();
const io = socketIO(server);

const TEST_DIR = process.env.CONTENT_PATH;

if ( !fs.existsSync( TEST_DIR ) ) {
    fs.mkdirSync( TEST_DIR );
}

io.on('connection', socket => {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('user disconnected')
    });

    socket.on('START_UPLOAD', (data) => {
        try {
            if (data.name.indexOf('.zip') === -1) {
                return errorHandler(socket, fileMap, data);
            }
            fileMap.set(data.name, {
                size: data.size,
                curSize: 0,
                stream: fs.createWriteStream(TEST_DIR + '/' + data.path + '/' + data.name),
                localPath: TEST_DIR + '/' + data.path + '/' + data.name,
                name: data.name,
                path: data.path
            });
        } catch (err) {
            errorHandler(socket, fileMap, data);
        }
    });

    socket.on('UPLOADING', (data) => {
        const curStat = fileMap.get(data.name);
        try {
            curStat.stream.write(data.data, 'binary');
            curStat.curSize = data.curSize;
            fileMap.set(data.name, curStat);
            console.log(`${curStat.name} UPLOADED: ${curStat.curSize} из ${data.size}`);
            const progress = Math.round(100*curStat.curSize/data.size);
            socket.emit('PROGRESS', progress);
        } catch (e) {
            errorHandler(socket, fileMap, data);
        }

    });

    socket.on('UPLOAD_ABORTED', data => {
        try {
            const curStat = fileMap.get(data.name);
            curStat.stream.close();
            fileMap.delete(data.name);
        } catch (e) {
            errorHandler(socket, fileMap, data);
        }

    });

    socket.on('UPLOAD_FINISHED', data => {
        try {
            const curStat = fileMap.get(data.name);
            curStat.stream.close();
            fileMap.delete(data.name);
            unzipFiles(socket, data, curStat);

        } catch (e) {
            console.log(e);
            errorHandler(socket, fileMap, data);
        }
    });

    const errorHandler = (socket, fileMap, data) => {
        const issueData = fileMap.get(data.name);
        issueData.stream.close();
        fs.unlink(issueData.localPath, err => {
            if (err) {
                console.log('Закончили');
            }
            console.log('Закончили');
        });
        const message = 'При загрузке оизошла ошибка';
        socket.emit('UPLOAD_ERROR', message)
    }
});

const unzipFiles = (socket, data, curStat) => {
    const localPathToReadZip = curStat.localPath;
    const localPathToExtractZip = TEST_DIR + '/' + curStat.path;
    const stream = fs.createReadStream(localPathToReadZip);
    stream.on('error', (err) => {
        return errorHandler(socket, fileMap, data)
    });
    stream.pipe(unzip.Parse())
        .on('entry', (entry) => {
            const fileName = entry.path;
            const size = entry.size;
            console.log(`Распакован файл ${fileName}`);
            if (fileName && fileName.match(/\.mp3|mp4|gif|png|jpeg|jpg|bmp/) !== null) { // Допилить загрузку файлов определенного типа
                const wrStream = fs.createWriteStream(localPathToExtractZip + '/' + fileName);
                wrStream.on('close', () => {
                    socket.emit('UPLOAD_SUCCESS', fileName)
                });
                entry.pipe(wrStream);
            } else {
                socket.emit('UPLOAD_FILTERED', fileName);
                entry.autodrain();
            }
        })
        .on('finish', () => {
            fs.unlink(localPathToReadZip, err => {
                if (err) {
                    console.log('Закончили');
                }
                console.log('Закончили');
            })
        });

};

server.listen(port, () => console.log(`Listening on port ${port}`));
