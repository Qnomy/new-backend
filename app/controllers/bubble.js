var contentHandler = require('../models/content');
var bubbleHandler = require('../models/bubble');
var bubbleCommentHandler = require('../models/bubble/bubble_comment');
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
            responseBuilder.sendResponse(res, 200, {bubble: bubble});
        };
    });
}

function disconnect(req, res){
    async.waterfall([function(callback){
        bubbleHandler.getBubbleByGeoContentId(req.params.cid, function(err, bubble){
           if(!err && !bubble){
            err = "No bubble for this content found"
           }
           return callback(err, bubble);
        });
    }, function(bubble, callback){
        bubbleHandler.disconectBubble(bubble, function(err, result){
            return callback(err, bubble, result);
        })
    }],function(err, bubble, result){
        if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, {bubble: bubble});
        };
    })
}

function getBubbleComments(req, res){
    async.waterfall([
        function(callback){
            bubbleHandler.getBubbleByGeoContentId(req.params.cid, function(err, bubble){
                return callback(err, bubble);
            });
        },
        function(bubble, callback){
        	if(req.params.last){
        		bubbleCommentHandler.getBubbleComment(req.params.last, function(err, last){
	                return callback(err, bubble, last);
	            });
        	}else{
        		return callback(null, bubble, null);
        	}
        },
        function(bubble, last, callback){
            bubbleCommentHandler.getBubbleComments(bubble, last, req.params.limit, function(err, comments){
                return callback(err, comments, bubble);
            })
        },
        function(comments, bubble, callback){
            bubbleHandler.getBubbleMembers(bubble, function(err, members){
                callback(err, comments, members);
            })
        }
    ],function (err, comments, members){
        if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, 
                {
                    'comments': comments,
                    'members': members
            });
        };
    });
}

function addBubbleComment(req, res){
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
            bubbleCommentHandler.addBubbleComment(bubble, user, req.body.body, function(err, comment){
                callback(err, comment);
            })
        }
    ],function (err, comment){
        if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, {comment: comment});
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
            bubbleHandler.blockBubble(bubble, user, function(err, bubble){
                callback(err, bubble);
            })
        }
    ],function (err, bubble){
        if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, {bubble: bubble});
        };
    });
}

module.exports = {
	join: join,
    disconnect: disconnect,
    getBubbleComments: getBubbleComments,
    addBubbleComment: addBubbleComment,
    blockBubble: blockBubble
}