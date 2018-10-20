const _ = require('lodash');
const redis = require('../init').redis;
const seq = require('../init').sequelize;
const Seq = require('../init').Sequelize;
const logger = require('../init').logger;

const enrichment = () => {
    return (req, res, next) => {
        const ctx = {
            redis,
            seq,
            Seq,
            logger
        };
        req.ctx = ctx;
        return next();
    }
};

module.exports = enrichment;