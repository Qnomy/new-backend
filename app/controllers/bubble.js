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
            	if(!err && !geoContent){
                    callback('No content found with id: ' + req.params.cid)
                }else{
                    callback(err, geoContent);
                }
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

function disconnect(req, res){
    async.waterfall([function(callback){
        contentHandler.getGeoContent(req.params.cid, function(err, geoContent){
            if(!err && !geoContent){
                return callback('No content found with id: ' + req.params.cid)
            }else{
                return callback(err, geoContent);
            }
        });
    }, function(geoContent, callback){
        contentHandler.disconnectGeoContentBubble(geoContent, function(err, result){
            return callback(err, result);
        })
    }],function(err, result){
        if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, result);
        };
    })
}

function getBubbleMessages(req, res){
    async.waterfall([
        function(callback){
            bubbleHandler.getBubbleByGeoContentId(req.params.cid, function(err, bubble){
                return callback(err, bubble);
            });
        },
        function(bubble, callback){
        	if(req.params.last){
        		bubbleMessageHandler.getBubbleMessage(req.params.last, function(err, last){
	                return callback(err, bubble, last);
	            });
        	}else{
        		return callback(null, bubble, null);
        	}
        },
        function(bubble, last, callback){
            bubbleMessageHandler.getBubbleMessages(bubble, last, req.params.limit, function(err, messages){
                return callback(err, messages, bubble);
            })
        },
        function(messages, bubble, callback){
            bubbleHandler.getBubbleMembers(bubble, function(err, members){
                callback(err, messages, members);
            })
        }
    ],function (err, messages, members){
        if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, 
                {
                    'comments': messages,
                    'members': members
            });
        };
    });
}

function addBubbleMessage(req, res){
    async.waterfall([
        function (callback){
            bubbleHandler.getBubbleByGeoContentId(req.params.cid, function(err, bubble){
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

function blockBubble(req, res){
    async.waterfall([
        function (callback){
            bubbleHandler.getBubbleByGeoContentId(req.params.cid, function(err, bubble){
                callback(err, bubble);
            });
        },
        function(bubble, callback){
            UserHandler.getUser(req.body.uid, function(err, user){
                callback(err, bubble, user);
            });
        },
        function(bubble, user, callback){
            bubbleHandler.blockBubbleMessage(bubble, user, function(err, result){
                callback(err, result);
            })
        }
    ],function (err, result){
        if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, result);
        };
    });
}

module.exports = {
	join: join,
    disconnect: disconnect,
    getBubbleMessages: getBubbleMessages,
    addBubbleMessage: addBubbleMessage,
    blockBubble: blockBubble
}