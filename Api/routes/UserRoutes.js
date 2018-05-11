'use strict'
var express = require('express');
var UserController = require('../controllers/UserController');
var api = express.Router();
var MiddlewareAuth = require('../middlewares/autenticated');
var multipart = require('connect-multiparty');
var MiddlewareUpload = multipart({uploadDir: './uploads/users'});

api.get('/home', MiddlewareAuth.ensureAuth, UserController.home);
api.post('/register', UserController.registerUser);
api.post('/login', UserController.loginUser);
api.get('/get-user/:id', MiddlewareAuth.ensureAuth, UserController.getOneUser);
api.get('/get-paged-users/:page?', MiddlewareAuth.ensureAuth, UserController.getPagedUsers);
api.get('/counters/:id?', MiddlewareAuth.ensureAuth, UserController.getCounters);
api.put('/update-user/:id', MiddlewareAuth.ensureAuth, UserController.updateUser);
api.post('/upload-avatar/:id', [MiddlewareAuth.ensureAuth, MiddlewareUpload], UserController.uploadAvatar);
api.get('/get-avatar/:imageFile', UserController.getAvatar);

module.exports = api;