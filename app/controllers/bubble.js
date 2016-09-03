var contentHandler = require('../models/content');
var bubbleHandler = require('../models/bubble');
var bubbleMessageHandler = require('../models/bubble/bubble_message');
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

function getBubbleMessages(req, res){
    async.waterfall([
        function(callback){
            bubbleHandler.getBubble(req.params.bid, function(err, bubble){
                return callback(err, bubble);
            });
        },
        function(bubble, callback){
        	if(req.params.last){
        		bubbleHandler.getBubble(req.params.last, function(err, last){
	                return callback(err, bubble, last);
	            });
        	}else{
        		return callback(null, bubble, null);
        	}
        },
        function(bubble, last, callback){
            bubbleMessageHandler.getBubbleMessages(bubble, last, req.params.limit, function(err, results){
                return callback(err, results);
            })
        }
    ],function (err, results){
        if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, results);
        };
    });
}

function addBubbleMessage(req, res){
    async.waterfall([
        function (callback){
            bubbleHandler.getBubble(req.params.bid, function(err, bubble){
                callback(err, bubble);
            });
        },
        function(bubble, callback){
            UserHandler.getUser(req.body.uid, function(err, user){
                callback(err, bubble, user);
            });
        },
        function(bubble, user, callback){
            bubbleMessageHandler.addBubbleMessage(bubble, user, req.body.body, function(err, message){
                callback(err, message);
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
	join: join,
    getBubbleMessages: getBubbleMessages,
    addBubbleMessage: addBubbleMessage
}