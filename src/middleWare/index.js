
const express = require('express');
const cookieParser = require('cookie-parser');
// Custom middleWare
const authHandler = require('./auth');
const enrichment = require('./enrichment');

module.exports = {
    initMiddleWare: (app, logger) => {
        app.set('view engine', 'jade');
        app
        .use(express.json())
        .use(express.urlencoded({ extended: true }))
        .use(cookieParser())
        .use(authHandler())
        .use(enrichment());
    }
};
