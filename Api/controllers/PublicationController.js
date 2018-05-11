'use strict'
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePagination = require('mongoose-pagination');
var PublicationModel = require('../models/PublicationModel');
var UserModel = require('../models/UserModel');
var FollowModel = require('../models/FollowModel');

function savePublication(req, res){
    var params = req.body;
    var publication = new PublicationModel();
    
    if(!params.text){
        return res.status(200).send({message: 'Agrega un texto a la publicación.'});
    }
    
    publication.text = params.text;
    publication.file = null;
    publication.createdAt = moment().unix();
    publication.user = req.user.sub;
    
    publication.save((err, publicationStored) => {
        if(err) return res.status(500).send({message: 'Error al guardar la publicación.'});
        if(!publicationStored) return res.status(404).send({message: 'La publicación no ha sido guardada.'});
        return res.status(200).send({publication: publicationStored});
    });
}

function getPublications(req, res){
    var userId = req.user.sub;
    var page = 1;
    
    if(req.params.page) page = req.params.page;
    
    var itemsPerPage = 4;
    FollowModel.find({user: userId}).populate('followed').exec((err, follows) => {
        if(err) return res.status(500).send({message: 'Error al obtener el seguimiento'});
        var followClean = [];
        follows.forEach((follow) => {
           followClean.push(follow.followed);
        });
        
        PublicationModel.find({user: {"$in": followClean}}).sort('-createdAt').populate('user')
            .paginate(page, itemsPerPage, (err, publications, total) => {
                if(err) return res.status(500).send({message: 'Error al obtener las publicaciones.'});
                if(!publications) return res.status(404).send({message: 'No se han encontrado publicaciones recientes.'});
                return res.status(200).send({
                    totalItems: total,
                    totalPages: Math.ceil(total/itemsPerPage),
                    page,
                    publications
                });
            });
    });
}

function getOnePublication(req, res){
    var publicationId = req.params.id;
    PublicationModel.findById(publicationId, (err, publication) => {
        if(err) return res.status(500).send({message: 'Error al obtener la publicación.'});
        if(!publication) return res.status(404).send({message: 'No se ha encontrado la publicación.'});
        return res.status(200).send({publication});
    });
}

function deletePublication(req, res){
    var userId = req.user.sub;
    var publicationId = req.params.id;
    PublicationModel.find({user: userId, _id: publicationId}).remove(err => {
        if(err) return res.status(500).send({message: 'Error al eliminar la publicación.'});
        if(!publicationRemoved) return res.status(404).send({message: 'No se ha encontrado la publicación a eliminar.'});
        return res.status(200).send({message: 'La publicación ha sido eliminada con éxito.'});
    });
}

function publishImage(req, res){
	var publicationId = req.params.id;

	if(req.files.image){
		var filePath = req.files.image.path;
		var fileName = filePath.split('\\')[2];
		var fileExtension = fileName.split('\.')[1];

		if(fileExtension == 'jpg' || fileExtension == 'png' || fileExtension == 'gif' || fileExtension == 'jpeg'){
            PublicationModel.findOne({user: req.user.sub, _id: publicationId}).exec((err, publication) => {
                if(publication){
                    PublicationModel.findByIdAndUpdate(publicationId, {file: fileName}, {new: true}, (err, publicationUpdated) => {
                        if(err) { return res.status(500).send({message: 'Error al actualizar la publicación.'}); }
                        if(!publicationUpdated) { return res.status(404).send({message: 'No se ha recibido ninguna imagen.'}); }
                        return res.status(200).send({publication: publicationUpdated});
                    });
                }
                else {
                    return removeFiles(res, filePath, 'No tienes permisos para actualizar la imagen de esta publicación.');
                }
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

function getPublishImage(req, res){
	var imageFile = req.params.imageFile;
	var pathFile = './uploads/publications/' + imageFile;

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
    savePublication,
    getPublications,
    getOnePublication,
    deletePublication,
    publishImage,
    getPublishImage
}