'use strict'
var UserModel = require('../models/UserModel');
var FollowModel = require('../models/FollowModel');
var mongoosePagination = require('mongoose-pagination');

function follow(req, res) {
	var params = req.body;
	var follow = new FollowModel();
	
	follow.user = req.user.sub;
	follow.followed = params.followed;

	follow.save((err, followStored) => {
		if(err) { return res.status(500).send({message: 'Hubo un error al guardar el seguimiento.'}) }
		if(!followStored) { return res.status(404).send({message: 'No se pudo guardar el seguimiento.'}) }
		return res.status(200).send({follow: followStored});
	});
}

function unfollow(req, res){
	var userId = req.user.sub;
	var followId = req.params.id;

	FollowModel.find({'user': userId, 'followed': followId}).remove(err => {
		if(err) { return res.status(500).send({message: 'Hubo un error al dejar de seguir al usuario.'}); }
		return res.status(200).send({message: 'Has dejado de seguir a este usuario.'});
	});
}

function getFollowing(req, res){
    var userId = req.user.sub;
    if(req.params.id && req.params.page){
        userId = req.params.id;
    }
    
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    
    var itemsPerPage = 4;
    FollowModel.find({user: userId}).populate({path: 'followed'}).paginate(page, itemsPerPage, (err, follows, total) => {
        if(err) { return res.status(500).send({message: 'Hubo un error al obtener los usuarios seguidos.'}); }
        if(!follows) { return res.status(404).send({message: 'No estas siguiendo a ningún usuario.'}); }
        return res.status(200).send({
            totalFollows: total,
            totalPages: Math.ceil(total/itemsPerPage),
            follows
        });
    });
}

function getFollowed(req, res){
    var userId = req.user.sub;
    if(req.params.id && req.params.page){
        userId = req.params.id;
    }
    
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    
    var itemsPerPage = 4;
    FollowModel.find({followed: userId}).populate({path: 'user'}).paginate(page, itemsPerPage, (err, follows, total) => {
        if(err) { return res.status(500).send({message: 'Hubo un error al obtener los usuarios seguidos.'}); }
        if(!follows) { return res.status(404).send({message: 'No te esta siguiendo ningún usuario.'}); }
        return res.status(200).send({
            totalFollows: total,
            totalPages: Math.ceil(total/itemsPerPage),
            follows
        });
    });
}

// Usuarios que sigo o me siguen
function getMyFollows(req, res){
    var userId = req.user.sub;
    var find = FollowModel.find({user: userId});
    
    if(req.params.followed){
        find = FollowModel.find({followed: userId});
    }
    
    find.populate('user followed').exec((err, follows) => {
        if(err) { return res.status(500).send({message: 'Hubo un error al obtener los usuarios seguidos.'}); }
        if(!follows) { return res.status(404).send({message: 'No estas siguiendo a ningún usuario.'}); }
        return res.status(200).send({follows});
    });
}

module.exports = {
	follow,
	unfollow,
    getFollowing,
    getFollowed,
    getMyFollows
}