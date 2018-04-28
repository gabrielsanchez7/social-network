'use strict'
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Carga de rutas
var userRoutes = require('./routes/UserRoutes');

// Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// rutas
app.use('/api', userRoutes);

// Exportar configuración
module.exports = app;