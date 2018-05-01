'use strict'
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Carga de rutas
var userRoutes = require('./routes/UserRoutes');
var followRoutes = require('./routes/FollowRoutes');

// Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// rutas
app.use('/api', userRoutes);
app.use('/api', followRoutes);

// Exportar configuración
module.exports = app;