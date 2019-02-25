const _ = require('lodash');
const moment = require('moment');
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
            logger,
            _,
            moment,
        };
        req.ctx = ctx;

        return next();
    };
};

module.exports = enrichment;
