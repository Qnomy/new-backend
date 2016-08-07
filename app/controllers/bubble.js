var contentHandler = require('../models/content');
var UserHandler = require('../models/user');
var errorHandler = require('./error_handler');
var responseBuilder = require("./response_builder");
var async = require('async');

function join(req, res){
	async.waterfall([
        function (callback){
            contentHandler.getGeoContent(req.params.cid, function(err, geoContent){
            	callback(err, geoContent);
            });
        },
        function(geoContent, callback){
            UserHandler.getUser(req.body.uid, function(err, user){
                callback(err,  geoContent, user);
            });
        },
        function(geoContent, user, callback){
        	contentHandler.joinGeoContentBubble(geoContent, user, function(err, bubble){
        		callback(err, bubble);
        	})
        }
    ],function (err, bubble){
        if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, bubble);
        };
    });
}

module.exports = {
	join: join
}