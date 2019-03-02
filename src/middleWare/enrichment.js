const _ = require('lodash');
const moment = require('moment');
const { redis, } = require('../init');
const seq = require('../init').sequelize;
const Seq = require('../init').Sequelize;
const { logger, } = require('../init');

const enrichment = () => (req, res, next) => {
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

module.exports = enrichment;
