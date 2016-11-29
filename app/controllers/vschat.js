var vschatHandler = require('../models/vschat');
var userHandler = require('../models/user');
var errorHandler = require('./error_handler');
var responseBuilder = require("./response_builder");
var async = require('async');

function createRoom(req, res){
	var members = req.body.members;
	vschatHandler.getMembersRoom(members, function(err, room){
		if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, room);
        };
	})
}

function getMessages(req, res){
	async.waterfall([
        function(callback){
            vschatHandler.getRoom(req.params.rid, function(err, room){
                return callback(err, room);
            });
        },
        function(room, callback){
        	if(req.params.last){
        		var message = vschatHandler.getMessage(room, req.params.last);
        		return callback(null, room, message);
        	}else{
        		return callback(null, room, null);
        	}
        },
        function(room, last, callback){
            vschatHandler.getMessages(room, last, req.params.limit, function(err, results){
                return callback(err, results);
            })
        }
    ],function (err, results){
        if (err){
            errorHandler.handle(res, err);
        } else {
			responseBuilder.sendResponse(res, 200, {'messages': results});
        };
    });
}

function addMessage(req, res){
	async.waterfall([
		function(callback){
			vschatHandler.getRoom(req.params.rid, function(err, room){
				return callback(err, room);
			});
		},
		function(room, callback){
			userHandler.getUser(req.body.uid, function(err, user){
				return callback(err, room, user);
			})
		}, function(room, user, callback){
			vschatHandler.addMessage(room, user, req.body.body, function(err, message){
				return callback(err, message);
			})
		}], function(err, response){
			if (err){
	            errorHandler.handle(res, err);
	        } else {
	            responseBuilder.sendResponse(res, 200, response);
	        };
	});
}

function removeMessage(req, res){
	async.waterfall([
		function(callback){
			vschatHandler.getRoom(req.params.rid, function(err, room){
				return callback(err, room);
			});
		}, function(room, callback){
			vschatHandler.removeMessage(room, req.params.mid, function(err, message){
				return callback(err, message);
			})
		}], function(err, response){
			if (err){
	            errorHandler.handle(res, err);
	        } else {
	            responseBuilder.sendResponse(res, 200, response);
	        };
	});
}

module.exports = {
	createRoom: createRoom,
	addMessage: addMessage,
	removeMessage: removeMessage,
	getMessages: getMessages
}