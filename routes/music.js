const express = require('express');
const router = express.Router();
const dirTree = require('directory-tree');
const _ = require('lodash');
const dotenv = require('dotenv').config();

router.post('/', async (req, res) => {
	try {
        const tree = dirTree(dotenv.parsed.CONTENT_PATH);
        tree.toggled = true;
		res.send(JSON.stringify({success: '1', data: tree}));
	} catch (err) {
		console.log(err);
		res.send(JSON.stringify({success: '0', error: err}));
	}
});

module.exports = router;

