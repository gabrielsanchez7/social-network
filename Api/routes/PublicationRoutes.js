'use strict'
var express = require('express');
var PublicationController = require('../controllers/PublicationController');
var api = express.Router();
var MiddlewareAuth = require('../middlewares/autenticated');
var multipart = require('connect-multiparty');
var MiddlewareUpload = multipart({uploadDir: './uploads/publications'});

api.post('/publish', MiddlewareAuth.ensureAuth, PublicationController.savePublication);
api.get('/publications/:page?', MiddlewareAuth.ensureAuth, PublicationController.getPublications);
api.get('/one-publication/:id', MiddlewareAuth.ensureAuth, PublicationController.getOnePublication);
api.delete('/remove-publication/:id', MiddlewareAuth.ensureAuth, PublicationController.deletePublication);
api.post('/publish-image/:id', [MiddlewareAuth.ensureAuth, MiddlewareUpload], PublicationController.publishImage);
api.get('/get-publish-image/:imageFile', PublicationController.getPublishImage);

module.exports = api;