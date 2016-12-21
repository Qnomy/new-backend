var errorHandler = require('./error_handler');
var responseBuilder = require('./response_builder');
var igAccountHandler = require('../models/social_account/instagram_account');
var async = require('async');git 

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
				if (err){
	            	return errorHandler.handle(res, err);
		        } else {
		            return responseBuilder.sendResponse(res, 200, {account: account});
		        };
			});
	}
}

var verifySubscription = function(req, res){

}

var logActivity = function(req, res){

}

module.exports = {
	handleAuth: handleAuth,
	verifySubscription: verifySubscription,
	logActivity: logActivity
}