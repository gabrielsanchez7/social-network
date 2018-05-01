'use strict'
var UserModel = require('../models/UserModel');
var FollowModel = require('../models/FollowModel');
var mongoosePagination = require('mongoose-pagination');

function prueba(req, res) {
	res.status(200).send({message: 'Prueba follow'});
}

module.exports = {
	prueba
}