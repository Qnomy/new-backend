var ErrorHandler = require('./error_handler');
var ResponseBuilder = require("./response_builder")
var async = require('async');
var FB = require('fb');

var ContentHandler = require('../models/content');

var output = module.exports;

output.get = function(req, res){
    async.waterfall([
        function (callback){
            callback(null);
        }
    ],function (err){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).write(req.query["hub.challenge"]);
            res.end();
            return;
        };
    });
};

output.post = function(req, res){
    var fs = require('fs');
    fs.appendFile('fblog.txt', Date().toString() + "\n" + JSON.stringify(req.body) + "\n\n", function (err) {});

    async.waterfall([
        function (callback) {
            req.body.entry.forEach(function(entry) {
                rec = new ContentHandler.PendingContentModel();
                rec.source = 1;
                rec.timestamp = Date(entry.time);
                rec.fields = entry.changed_fields;
                rec.uid= entry.uid;
                rec.save(function(err){
                    if (err) callback(err);
                });
            });
            callback(null);
        }
    ],function (err){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).write("ok");
            res.end();
            return;
        };
    });
};

output.processPending = function (req, res) {
    async.waterfall([
        function (callback){
            // ContentHandler.PendingContentModel.find({}, function(err, records) {
            //     records.forEach(function (rec) {
            //     })
            // });
            FB.api('/me?access_token=EAAVZCL30UfR0BABit45Cw45rAzZCICkbgfuW0TZAcPFtUk18hZBOjpLPMmryYOT56G0oOIaPdw0flMNxCVyXBE4WwZAXa1o3XzuYcU2q95FU9GeLYUHLK5InLo7Ah5BUWPH7ZAOsZBqCE3advsMAmf21WvonGKZBq9ESw62c9ZC8CPJE6Ae8plw1WHg6w9jUSaPIZD', {fields: ['id', 'name', 'location']}, function (res) {
                if(!res || res.error) {
                    console.log(!res ? 'error occurred' : res.error);
                    return;
                }
                console.log(res.id);
                console.log(res.name);
            });
            callback(null);
        }
    ],function (err){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            res.end();
            return;
        };
    });
}