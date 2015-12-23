/**
 * Created by alan on 12/18/15.
 */
var mongoose = require('mongoose');
var config = require('./config');

var connection = mongoose.connection;
config.status.mongodb_alive = false;
var connect = function() {
    mongoose.connect(config.db, {server: { auto_reconnect: true }, autoIndex: process.env.NODE_ENV !== 'production' });
};
connect();

connection.on('error', function() {
    console.log('Could not connect to MongoDB');
    mongoose.disconnect();
});

connection.on('disconnected', function(){
    console.log('Lost MongoDB connection...');
    config.status.mongodb_alive = false;
    setTimeout(function() {
        console.log('reconnecting to MongoDB');
        connect();
    },2000);
});

connection.on('connected', function() {
    config.status.mongodb_alive = true;
    console.log('Connection established to MongoDB');
});

connection.on('reconnected', function() {
    config.status.mongodb_alive = true;
    console.log('Reconnected to MongoDB');
});

process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Force to close the MongoDB conection');
        config.status.mongodb_alive = true;
        process.exit(0);
    });
});

module.exports = connection;