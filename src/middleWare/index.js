const express = require('express');
const cookieParser = require('cookie-parser');

// Custom middleWare
const authHandler = require('./auth');

module.exports = {
    initMiddleWare(app) {
        app.set('view engine', 'jade');
        app.use(express.json())
            .use(express.urlencoded({ extended: true, }))
            .use(cookieParser())
            .use(authHandler());
    },
};
