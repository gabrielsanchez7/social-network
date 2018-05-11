'use strict'
var express = require('express');
var api = express.Router();
var MessageController = require('../controllers/MessageController');
var MiddlewareAuth = require('../middlewares/autenticated');

api.post('/send-message', MiddlewareAuth.ensureAuth, MessageController.sendMessage);
api.get('/received-messages/:page?', MiddlewareAuth.ensureAuth, MessageController.getReceivedMessages);
api.get('/sent-messages/:page?', MiddlewareAuth.ensureAuth, MessageController.getSentMessages);
api.get('/unread-messages', MiddlewareAuth.ensureAuth, MessageController.getUnreadMessages);
api.put('/read-message/:id', MiddlewareAuth.ensureAuth, MessageController.readMessage);

module.exports = api;