const express = require('express');
const router = express.Router();
const dirTree = require('directory-tree');
const _ = require('lodash');
const dotenv = require('dotenv').config();
const redis = require('../init').redis;
const models = require('../init').sequelize.models;
const allowedMusicTypes = ['.mp3', '.flac'];

router.post('/', async (req, res) => {
	try {
        let tree = {};
        const content = await redis.get(dotenv.parsed.CONTENT_PATH);
        if (!content) {
        	tree = dirTree(dotenv.parsed.CONTENT_PATH);
            tree.toggled = true;
            const actualContent = await getContentArray(tree);
            await updateContent(actualContent); //todo: сделать принудительный апдейт
            await redis.set(dotenv.parsed.CONTENT_PATH, JSON.stringify(tree), 'EX', dotenv.parsed.REDIS_CONTENT_UPDATE_TIME);
            return res.send(JSON.stringify({success: '1', data: tree}));
		}
        tree = JSON.parse(content);
		return res.send(JSON.stringify({success: '1', data: tree}));
	} catch (err) {
		console.log(err);
        return res.send(JSON.stringify({success: '0', error: err}));
	}
});

const getContentArray = async (baseFolderStruct) => {
    try {
        if (!baseFolderStruct) {
			throw new Error('Парсинг дерева контента: Ошибка: пустой объект')
        }
        const pathArr = [];
        const nameArr = [];
             (function searchInTree(node) {
                if (node.children) {
                    for (let index = 0; index < node.children.length; index++) {
                        let el = node.children[index];
                        const isTypeAllowed = allowedMusicTypes.some(type => type ===  el.extension);
                        if (el.type === 'file' && isTypeAllowed) {
                            pathArr.push(el.path);
                            nameArr.push(el.name);
						}
                        searchInTree(el);
                    }
                }
            })(baseFolderStruct);
            return Promise.resolve({pathArr: pathArr, nameArr: nameArr});
	} catch (err) {
    	console.error(err)
 	}
};

const updateContent = async (actualContent) => {
	try {
        const previusContent = await models.tracks.findAll();
        for (let j = 0; j < actualContent.nameArr.length; j++) {
            const isNameFound = previusContent.some(el => actualContent.nameArr[j] === el.dataValues.name);
            const isPathFound = previusContent.some(el => actualContent.nameArr[j] === el.dataValues.name);
            if (!(isPathFound && isNameFound)) {
                await models.tracks.upsert({ //todo: оптимизировать запись
                    name: actualContent.nameArr[j],
                    path: actualContent.pathArr[j],
                });
            }

        }
	} catch (err) {
        console.error(err);
		throw new Error(err.message);
    }
};

module.exports = router;

