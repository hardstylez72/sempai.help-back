module.exports = initMiddleWare = (app) => {

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

    // Custom middleWare
    app.use(authHandler());
    app.use(enrichment());
};
