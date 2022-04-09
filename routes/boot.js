const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const apiRoutes = require('./api');
const webRoutes = require('./web');
const error = require('../middleware/error');

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
    exposedHeaders: 'x-auth-token',
};


module.exports=function (app){
    app.use(compression());
    app.use(express.json());
    app.use(express.static('public'));
    app.use(cors(corsOptions));
    app.use(helmet({crossOriginEmbedderPolicy: false}));
    app.use('/api', apiRoutes);
    app.use('/', webRoutes);
    app.use(error);
};