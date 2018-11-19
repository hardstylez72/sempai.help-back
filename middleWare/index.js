module.exports = initMiddleWare = (app) => {
    const multiparty  = require('connect-multiparty');
    const multipartMiddleware = multiparty({ uploadDir: process.env.CONTENT_PATH });

    const express = require('express');
    const cookieParser = require('cookie-parser');
    const path = require('path');

    // Custom middleWare
    const authHandler = require('./auth');
    const enrichment = require('./enrichment');

    app.set('view engine', 'jade');
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(multipartMiddleware);

    // Custom middleWare
    app.use(authHandler());
    app.use(enrichment());
};
