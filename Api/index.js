'use strict'
var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

// Conexión a la base de datos
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/social_media', {useMongoClient: true})
	.then(() => {
		console.log('Conexión a la base de datos social_media se ha realizado correctamente.');
		// Crear servidor
		app.listen(port, () => {
			console.log(`Servidor local corriendo en el puerto ${port}`);
		});
	})
	.catch(err => console.log(err));