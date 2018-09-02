var express = require('express');
var router = express.Router();
const fs = require('fs');
const dataStore = '/media/hardstylez72/Новый том/music/';
const _ = require('lodash');
const Base64 = require('js-base64').Base64;
let currentFile = false;



/* GET home page. */
router.get('/:base64path', async (req, res) => {
	try {
		const jsonData = Buffer(req.params.base64path, 'base64').toString('utf-8');
		const data = JSON.parse(jsonData);
		if (_.has(data, 'path')) {
				const pathToFile = _.get(data, 'path', null);
				const isPathExist = await fs.existsSync(`${pathToFile}`);
				if (isPathExist) {
					const stat = fs.statSync(pathToFile);
					const path = pathToFile;
					const fileSize = stat.size;
					const range = req.headers.range;
					if (range) { //todo нужно завести таймаут на закрытие стрима
						const parts = range.replace(/bytes=/, '').split('-');
						const start = parseInt(parts[0], 10);
						const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
						const chunksize = end - start + 1;
						const file = fs.createReadStream(path, {start, end});
						const head = {
							'Content-Range': `bytes ${start}-${end}/${fileSize}`,
							'Accept-Ranges': 'bytes',
							'Content-Length': chunksize,
							'Content-type': 'audio/*'
						};
						res.writeHead(206, head);
						if (currentFile !== path && currentFile) {
							fs.createReadStream(currentFile).close();
						}
						file.pipe(res);
						currentFile = path;
						
					} else {
						const head = {
							'Content-Length': fileSize,
							'Content-type': 'audio/*'
						};
						res.writeHead(200, head);
						fs.createReadStream(path).pipe(res);
					}
				} else {
					console.log(err.message);
				}
			} else {
				console.log(err);
			}
	} catch (err) {
		console.log(err);
	}
});

router.get('/download/:base64path', async (req, res) => {
	try {
		const jsonData = Buffer(req.params.base64path, 'base64').toString('utf-8');
		const data = JSON.parse(jsonData);
		if (_.has(data, 'path')) {
			const pathToFile = _.get(data, 'path', null);
			const isPathExist = await fs.existsSync(`${pathToFile}`);
			if (isPathExist) {
				const stat = fs.statSync(pathToFile);
				const path = pathToFile;
				const fileSize = stat.size;
				const range = req.headers.range;
				if (range) { //todo нужно завести таймаут на закрытие стрима
					const parts = range.replace(/bytes=/, '').split('-');
					const start = parseInt(parts[0], 10);
					const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
					const chunksize = end - start + 1;
					const file = fs.createReadStream(path, {start, end});
					const head = {
						'Content-Range': `bytes ${start}-${end}/${fileSize}`,
						'Accept-Ranges': 'bytes',
						'Content-Length': chunksize,
						'Content-Type': 'audio/flac'
					};
					res.writeHead(206, head);
					if (currentFile !== path && currentFile) {
						fs.createReadStream(currentFile).close();
					}
					file.pipe(res);
					currentFile = path;

				} else {
					const head = {
						'Content-Length': fileSize,
						'Content-Type': 'audio/flac'
					};
					res.writeHead(200, head);
					fs.createReadStream(path).pipe(res);
				}
			} else {
				console.log(err.message);
			}
		} else {
			console.log(err);
		}
	} catch (err) {
		console.log(err);
	}
});
router.post('/cover/:base64path', async (req, res) => {
	try {
		const jsonData = Buffer(req.params.base64path, 'base64').toString('utf-8');
		const data = JSON.parse(jsonData);
		if (_.has(data, 'path')) {
				const pathToFile = _.get(data, 'path', null);
				const lastChar = pathToFile.lastIndexOf('/');
				const pathWhithCover = pathToFile.slice(0, lastChar + 1);
				const files = await fs.readdirSync(pathWhithCover);
				const imgs = files.filter(el => {
					if ((el.indexOf('.png') !== -1) || (el.indexOf('.jpeg') !== -1) || (el.indexOf('.jpg') !== -1) || (el.indexOf('.gif') !== -1)) {
						return true;
					}
					return false
				});
				if (imgs.length !== 0) {
					let prefix = '';
					if (imgs[0].indexOf('.png') !== -1) prefix = 'png';
					if (imgs[0].indexOf('.jpeg') !== -1) prefix = 'jpeg';
					if (imgs[0].indexOf('.jpg') !== -1) prefix = 'jpg';
					if (imgs[0].indexOf('.gif') !== -1) prefix = 'gif';
					const img = pathWhithCover + imgs[0];
					let imgData = await fs.readFileSync(img, 'base64');
					imgData =`data:image/${prefix};base64,` + imgData ;
					res.send(JSON.stringify({sucsess: '1', data: imgData}));
				} else {
					res.send(JSON.stringify({sucsess: '1', data: ''}));
				}
		}
	} catch (err) {
		res.send(JSON.stringify({sucsess: '0'}));
	}
});

module.exports = router;
