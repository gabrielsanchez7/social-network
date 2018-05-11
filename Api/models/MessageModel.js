'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = Schema({
	text: String,
    viewed: Boolean,
	createdAt: String,
	emitter: {type: Schema.ObjectId, ref: 'User'},
	receiver: {type: Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Message', MessageSchema);