const express = require('express');
const router = express.Router();
const dirTree = require('directory-tree');
const _ = require('lodash');
const dotenv = require('dotenv').config();
const redis = require('../init').redis;
const models = require('../init').sequelize.models;
const sequelize = require('../init').sequelize;
const Sequelize = require('../init').Sequelize;
const allowedMusicTypes = ['.mp3', '.flac'];

router.post('/', async (req, res) => {
    const { logger } = req.ctx;
	try {
        let tree = {};
        const content = await redis.get(process.env.CONTENT_PATH);
        if (!content) {
            logger.info('process.env.CONTENT_PATH = ', process.env.CONTENT_PATH);
        	tree = dirTree(process.env.CONTENT_PATH, {extensions:/\.mp3|\.flac/});
            tree.toggled = true;
            const actualContent = await getContentArray(tree);
            await updateContent(actualContent); //todo: сделать принудительный апдейт
            await redis.set(process.env.CONTENT_PATH, JSON.stringify(tree), 'EX', process.env.REDIS_CONTENT_UPDATE_TIME);
            return res.send(JSON.stringify({success: '1', data: tree}));
		}
        tree = JSON.parse(content);
		return res.send(JSON.stringify({success: '1', data: tree}));
	} catch (err) {
        logger.error(err);
        return res.send(JSON.stringify({success: '0', error: err}));
	}
});

router.get('/favorite', async (req, res) => {
    try {
        const result = await sequelize.query(`
    select 
        tracks.tracks."name"
        ,tracks.tracks."path"
    from tracks.tracks
      join tastes.tastes on tastes.tastes.track_id = tracks.tracks.id
      join users.users on users.users.id = tastes.tastes.user_id
      where users.users."name" = '${req.sessionInfo}' and tastes.tastes.deleted <> true
        `, {type: Sequelize.QueryTypes.SELECT});

        if (!result) {
            return res.send(JSON.stringify({success: '0', error: 'error'}));
        }
        return res.send(JSON.stringify({success: '1', data: result}));
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
        const newFiles = previusContent.filter((el, j) => {
            const isNameFound = previusContent.some(el => actualContent.nameArr[j] === el.dataValues.name);
            const isPathFound = previusContent.some(el => actualContent.nameArr[j] === el.dataValues.name);
            if (!(isPathFound && isNameFound)) {
                return false;
            }
            return true;
        });

        const bulk = newFiles.map(el => {
            return {
                name: el.name,
                path: el.path,
                uploader_id: 1
            }
        });
        await models.tracks.bulkCreate(bulk);

	} catch (err) {
        console.error(err);
		throw new Error(err.message);
    }
};

module.exports = router;

