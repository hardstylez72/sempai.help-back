const _ = require('lodash');
const moment = require('moment');
const { redis } = require('../init');
const { logger } = require('../init');

const enrichment = () => (req, res, next) => {
    const ctx = {
        redis,
        logger,
        _,
        moment,
    };

    req.ctx = ctx;

    return next();
};

module.exports = enrichment;
