'use strict'
var express = require('express');
var api = express.Router();
var FollowController = require('../controllers/FollowController');
var MiddlewareAuth = require('../middlewares/autenticated');

api.post('/follow', MiddlewareAuth.ensureAuth, FollowController.follow);
api.delete('/unfollow/:id', MiddlewareAuth.ensureAuth, FollowController.unfollow);
api.get('/following/:id?/:page?', MiddlewareAuth.ensureAuth, FollowController.getFollowing);
api.get('/followed/:id?/:page?', MiddlewareAuth.ensureAuth, FollowController.getFollowed);
api.get('/my-follows/:followed?', MiddlewareAuth.ensureAuth, FollowController.getMyFollows);

module.exports = api;