'use strict'

var UserModel = require('../models/UserModel');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mongoosePagination = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

function home(req, res) {
	res.status(200).send({message: 'Controlador funcionando'});
}

function registerUser(req, res){
	var user = new UserModel();
	var params = req.body;

	if(params.name && params.surname && params.nick && params.email && params.password){
		user.name = params.name;
		user.surname = params.surname;
		user.nick = params.nick;
		user.email = params.email;
		user.role = 'ROLE_USER';
		user.image = null;

		// Controlar usuarios duplicados
		UserModel.find({
			$or: [
				{email: user.email.toLowerCase()},
				{nick: user.nick}
			]
		}).exec((err, users) => {
			if(err) { return res.status(500).send({message: 'Error en la petición de usuarios'}); }
			if(users && users.length >= 1) { return res.status(200).send({message: 'Ya existe un usario registrado con este email o nick.'}); }
			else {
				// Encriptar contraseña y guardar datos
				bcrypt.hash(params.password, null, null, (err, hash) => {
					user.password = hash;
					user.save((err, userStored) => {
						if(err) { return res.status(500).send({message: 'Error al guardar el usuario'}); }
						if(userStored){ res.status(200).send({user: userStored}); }
						else { res.status(404).send({message: 'No se ha registrado el usuario'}); }
					});
				});
			}
		});
	}
	else {
		res.status(200).send({message:'Todos los campos son necesarios'});
	}
}

function loginUser(req, res){
	var params = req.body;
	var email = params.email;
	var password = params.password;

	UserModel.findOne({email: email}, (err, user) => {
		if(err) { return res.status(500).send({message: 'Error al obtener el usuario'}); }
		if(user) {
			bcrypt.compare(password, user.password, (err, check) => {
				if(check){
					if(params.getToken){
						return res.status(200).send({token: jwt.createToken(user)});
					}
					else {
						user.password = undefined;
						return res.status(200).send({user});
					}
				}
				else { return res.status(404).send({message: 'El usuario no se ha podido identificar'}); }
			});
		}
		else {
			return res.status(404).send({message: 'El usuario no se ha podido identificar'});
		}
	});
}

function getOneUser(req, res){
	var userId = req.params.id;
	UserModel.findById(userId, (err, user) => {
		if(err) { return res.status(500).send({message: 'Error al obtener el usuario'}); }
		if(!user) { return res.status(404).send({message: 'El usuario no existe.'}); }
		return res.status(200).send({user});
	});
}

function getPagedUsers(req, res){
	var identityUserId = req.user.sub;
	var page;
	var itemsPerPage = 5;
	(req.params.page) ? page = this : page = 1;

	UserModel.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
		if(err) { return res.status(500).send({message: 'Error al obtener los usuarios paginados.'}); }
		if(!users) { return res.status(404).send({message: 'No existen usuarios registrados.'}); }
		return res.status(200).send({
			users, total, pages: Math.ceil(total/itemsPerPage)
		});
	});
}

function updateUser(req, res){
	var userId = req.params.id;
	var update = req.body;

	delete update.password;

	if(userId != req.user.sub){
		return res.status(500).send({message: 'No tienes permiso para actualizar los datos de este usuario.'});
	}

	UserModel.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
		if(err) { return res.status(500).send({message: 'Error al actualizar el usuario.'}); }
		if(!userUpdated) { return res.status(404).send({message: 'No se han recibido los datos completos'}); }
		return res.status(200).send({user: userUpdated});
	});
}

function uploadAvatar(req, res){
	var userId = req.params.id;

	if(req.files.image){
		var filePath = req.files.image.path;
		var fileName = filePath.split('\\')[2];
		var fileExtension = fileName.split('\.')[1];

		if(userId != req.user.sub){
			return removeFiles(res, filePath, 'No tienes permiso para actualizar los datos de este usuario.');
		}

		if(fileExtension == 'jpg' || fileExtension == 'png' || fileExtension == 'gif' || fileExtension == 'jpeg'){
			UserModel.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpdated) => {
				if(err) { return res.status(500).send({message: 'Error al actualizar el usuario.'}); }
				if(!userUpdated) { return res.status(404).send({message: 'No se han recibido los datos completos'}); }
				return res.status(200).send({user: userUpdated});
			});
		}
		else {
			return removeFiles(res, filePath, 'Extensión no válida.');
		}
	}
	else {
		return res.status(200).send({message: 'No se ha subido ninguna imagen'});
	}
}

function removeFiles(res, filePath, message){
	fs.unlink(filePath, err => {
		return res.status(200).send({message: message});
	});
}

function getAvatar(req, res){
	var imageFile = req.params.imageFile;
	var pathFile = './uploads/users/' + imageFile;

	fs.exists(pathFile, (exists) => {
		if(exists) {
			res.sendFile(path.resolve(pathFile));
		}
		else {
			res.status(200).send({message: 'No existe la imagen.'});
		}
	});
}

module.exports = {
	home,
	registerUser,
	loginUser,
	getOneUser,
	getPagedUsers,
	updateUser,
	uploadAvatar,
	getAvatar
}