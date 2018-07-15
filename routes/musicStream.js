var express = require('express');
var router = express.Router();
const fs = require('fs');
const dataStore = '/media/hardstylez72/Новый том/music/';
/* GET home page. */
router.get('/', async (req, res) => {
	try {
		const isPathExist = await fs.existsSync(dataStore);
		if (isPathExist) {
			const files = await fs.readdirSync(dataStore);
			const stat = fs.statSync(`${dataStore}${files[0]}`);
			const path = `${dataStore}${files[0]}`;
			const fileSize = stat.size;
			const range = req.headers.range;
			if (range) {
				const parts = range.replace(/bytes=/, '').split('-');
				const start = parseInt(parts[0], 10);
				const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
				const chunksize = end - start + 1;
				const file = fs.createReadStream(path, {start, end});
				const head = {
					'Content-Range': `bytes ${start}-${end}/${fileSize}`,
					'Accept-Ranges': 'bytes',
					'Content-Length': chunksize,
					'Content-Type': 'flac',
				};
				res.writeHead(206, head);
				file.pipe(res);
			} else {
				const head = {
					'Content-Length': fileSize,
					'Content-Type': 'flac',
				};
				res.writeHead(200, head);
				fs.createReadStream(path).pipe(res);
			}
		} else {
			console.log(err);
		}
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
