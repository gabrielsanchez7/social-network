'use strict'
var moment = require('moment');
var mongoosePagination = require('mongoose-pagination');
var MessageModel = require('../models/MessageModel');
var UserModel = require('../models/UserModel');
var FollowModel = require('../models/FollowModel');

function sendMessage(req, res){
    var emitter = req.user.sub;
    var params = req.body;
    if(!params.text || !params.receiver){
        console.log(params)
        return res.status(200).send({message: 'Enviar campos necesarios.'});
    }
    
    var message = new MessageModel();
    message.text = params.text;
    message.viewed = false;
    message.createdAt = moment().unix();
    message.emitter = emitter;
    message.receiver = params.receiver;
    
    message.save((err, messageStored) => {
        if(err) return res.status(500).send({message: 'Error al enviar el mensaje.'});
        if(!messageStored) return res.status(404).send({message: 'No hay un mensaje por enviar.'});
        return res.status(200).send({message: messageStored});
    });
}

function getReceivedMessages(req, res){
    var userId = req.user.sub;
    var page = 1;
    if(req.params.page) page = req.params.page;
    var itemsPerPage = 4;
    
    MessageModel.find({receiver: userId}).populate('emitter', 'name surname _id nick image')
        .paginate(page, itemsPerPage, (err, messages, total) => {
            if(err) return res.status(500).send({message: 'Error al recibir los mensajes.'});
            if(!messages) return res.status(404).send({message: 'No hay ningún mensaje.'});
            return res.status(200).send({
                totalMessages: total,
                totalPages: Math.ceil(total/itemsPerPage),
                messages
            });
    });
}

function getSentMessages(req, res){
    var userId = req.user.sub;
    var page = 1;
    if(req.params.page) page = req.params.page;
    var itemsPerPage = 4;
    
    MessageModel.find({emitter: userId}).populate('receiver', 'name surname _id nick image')
        .paginate(page, itemsPerPage, (err, messages, total) => {
            if(err) return res.status(500).send({message: 'Error al recibir los mensajes.'});
            if(!messages) return res.status(404).send({message: 'No hay ningún mensaje.'});
            return res.status(200).send({
                totalMessages: total,
                totalPages: Math.ceil(total/itemsPerPage),
                messages
            });
    });
}

function getUnreadMessages(req, res){
    var userId = req.user.sub;
    
    MessageModel.count({receiver: userId, viewed: false}).exec((err, count) => {
        if(err) return res.status(500).send({message: 'Error al recibir los mensajes.'});
        return res.status(200).send({unreadMessage: count});
    });
}

function readMessage(req, res){
    var userId = req.user.sub;
    var messageId = req.params.id;
    
    MessageModel.findOne({receiver: userId, _id: messageId}).update({viewed: true}).exec((err, message) => {
        if(err) return res.status(500).send({message: 'Error al obtener el mensajes.'});
        return res.status(200).send({message: 'El mensaje ha sido leido'});
    });
}

module.exports = {
    sendMessage,
    getReceivedMessages,
    getSentMessages,
    getUnreadMessages,
    readMessage
}