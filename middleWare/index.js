module.exports = initMiddleWare = (app) => {

    const express = require('express');
    const cookieParser = require('cookie-parser');
    const path = require('path');

    // Custom middleWare
    const authHandler = require('./auth');
    const enrichment = require('./enrichment');

    // app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    // app.use(express.static(path.join(__dirname, 'public')));

    // Custom middleWare
    app.use(authHandler());
    app.use(enrichment());
};
