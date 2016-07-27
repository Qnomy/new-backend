'use strict';

var fs = require('fs');
var join = require('path').join;
var express = require('express');
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
// Contains the kafka configuration and connection.
//require('./app/config/kafka');
// Contains the mongodb configuration and connection.
require('./app/config/mongodb');

var port = process.env.PORT || 3000;

https.createServer({
  key: privateKey,
  cert: certificate
}, app).listen(port);

console.log('Express app started on port ' + port);

