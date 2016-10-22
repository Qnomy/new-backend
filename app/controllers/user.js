var userHandler = require('../models/user');
var userActivityHandler = require('../models/user_activity');
var userDeviceHandler = require('../models/user_device');
var async = require('async');
var errorHandler = require('./error_handler');
var responseBuilder = require("./response_builder");

function getUserActivities(req, res){
	async.waterfall([function(callback){
		userHandler.getUser(req.params.uid, callback);
	}, function(user, callback){
		if(req.params.last){
			userActivityHandler.getUserActivity(req.params.last, function(err, activity){
				callback(err, user, activity);
			})
		}else{
			callback(null, user, null)
		}
	}, function(user, last, callback){
		userActivityHandler.getUserActivities(user, last, req.params.limit, callback);
	}], function(err, results){
		if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, {'activities': results});
        };
	})
}

function registerUserDevice(req, res){
	async.waterfall([function(callback){
		userHandler.getUser(req.params.uid, callback);
	}, function(user, callback){
		userDeviceHandler.createUserDevice(user, req.body.platform, req.body.token, callback);
	}], function(err, results){
		if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, {'user_device': results});
        };
	});
}

module.exports = {
	getUserActivities: getUserActivities,
	registerUserDevice: registerUserDevice
}