'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowSchema = Schema({
	user: {type: ObjectId, ref: 'User'},
	followed: {type: ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Follow', FollowSchema);