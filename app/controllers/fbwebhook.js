var ErrorHandler = require('./error_handler');
var ResponseBuilder = require("./response_builder")
var async = require('async');
var Config = require('../config/config');
var ContentHandler = require('../models/content');
var UserHandler = require('../models/user');
var SocialAccountHandler = require('../models/social_account');

var output = module.exports;

output.get = function(req, res){
    var verified = config.facebook.webhooks.verify_token == req.query["hub.verify_token"];
    if(verified){
        res.status(200).write(req.query["hub.challenge"]);
        res.end();
    }else{
        err = "Bad facebook webhook verification token";
        ErrorHandler.handle(res, err);
    }
};

output.post = function(req, res){
    async.waterfall([
        function(callback){
            var entries = req.body.entry;
            if(entries.length > 0){
                var entry = entries[0]; // we look at the first entry for now
                ContentHandler.transform(entry, SocialAccountHandler.AccountTypes.Facebook, function(err, geoContent){
                    return callback(err, geoContent, entry.uid);
                })
            }
        }, 
        function(geoContent, social_id, callback){
            UserHandler.markContentLocation(geoContent, SocialAccountHandler.AccountTypes.Facebook, social_id, function(err, geoContent){
                return callback(err, geoContent);
            })
        },
        function(geoContent, callback){
            ContentHandler.updateGeoContent(geoContent, function(err, result){
                return callback(err, result);
            });
        }],function(err, result){
            console.log(err);
            if (err){
                ErrorHandler.handle(res, err);
            }else{
                ResponseBuilder.sendResponse(res, 200);
            }
        });
};