var errorHandler = require('./error_handler');
var responseBuilder = require('./response_builder');
var userHandler = require('../models/user');
var igAccountHandler = require('../models/social_account/instagram_account');
var async = require('async');

var handleAuth = function(req, res){
	if(req.params.error){
		return errorHandler.handle(res, {
			error:req.params.error, 
			error_reason: params.error_reason, 
			error_description: error_description
		});
	}else{
		async.waterfall([
			function(callback){
				userHandler.getUser(req.params.uid,function(err, user){
	                if (!user){
	                    return callback("The user does not exist in our system.");
	                } else {
	                    return callback(err, user);
	                }
	            });
			}, function(user, callback){
				igAccountHandler.registerAccessToken(user, req.params.code, function(err, account){
					callback(err, account);
				});
			}], function(err, account){
				
			});
	}
}

var verifySubscription = function(req, res){
	if(req.params.hub 
		&& req.params.hub.mode == 'subscribe'
		&& req.params.hub.verify_token == config.instagram.verify_token){
			return responseBuilder.sendResponse(res, 200, req.params.hub.challenge);
	}else{
		return errorHandler.handle(res, 'verification error');
	}
}

var logActivity = function(req, res){

}

module.exports = {
	handleAuth: handleAuth,
	verifySubscription: verifySubscription,
	logActivity: logActivity
}