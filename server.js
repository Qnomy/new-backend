'use strict';

var fs = require('fs');
var join = require('path').join;
var express = require('express');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('ssl-keys/bubbleyou-private.key', 'utf8');
var certificate = fs.readFileSync('ssl-keys/bubbleyou-cert.pem', 'utf8');
var winston = require('winston');
var expressWinston = require('express-winston');
var app = express();

var logger = expressWinston.logger({
	transports: [
		new winston.transports.Console({
			json: true,
			colorize: true
		})
	],
	meta: true,
	expressFormat: true,
	colorStatus: true
})

app.use(logger);

// Contains the models definitino for mongo.
require('./app/config/models')(app);
// Contains the express configuration.
require('./app/config/express')(app);
// Contains the routes configuration pointing to the controllers.
require('./app/config/routes')(app);
//initiate services
require('./app/service/user_activity');
// Contains the kafka configuration and connection.
//require('./app/config/kafka');
// Contains the mongodb configuration and connection.
var mongodb = require('./app/config/mongodb');

var http_port = process.env.PORT || 3000;
var https_port = http_port + 10;

http.createServer(app).listen(http_port);

https.createServer({
  key: privateKey,
  cert: certificate
}, app).listen(https_port);

console.log('Express http app started on port ' + http_port);
console.log('Express https app started on port ' + https_port);

