'use strict';

var fs = require('fs');
var join = require('path').join;
var express = require('express');

var app = express();


// Contains the models definitino for mongo.
require('./app/config/models')(app);

// Contains the express configuration.
require('./app/config/express')(app);
// Contains the routes configuration pointing to the controllers.
require('./app/config/routes')(app);
// Contains the kafka configuration and connection.
require('./app/config/kafka');
// Contains the mongodb configuration and connection.
require('./app/config/mongodb');

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Express app started on port ' + port);

