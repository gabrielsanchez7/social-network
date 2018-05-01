'use strict'
var express = require('express');
var api = express.Router();
var FollowController = require('../controllers/FollowController');
var MiddlewareAuth = require('../middlewares/autenticated');

api.get('/prueba', MiddlewareAuth.ensureAuth, FollowController.prueba);

module.exports = api;