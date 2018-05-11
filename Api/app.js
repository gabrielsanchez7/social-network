'use strict'
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Carga de rutas
var userRoutes = require('./routes/UserRoutes');
var followRoutes = require('./routes/FollowRoutes');
var publicationRoutes = require('./routes/PublicationRoutes');
var messageRoutes = require('./routes/MessageRoutes');

// Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});

// rutas
app.use('/api', userRoutes);
app.use('/api', followRoutes);
app.use('/api', publicationRoutes);
app.use('/api', messageRoutes);

// Exportar configuración
module.exports = app;