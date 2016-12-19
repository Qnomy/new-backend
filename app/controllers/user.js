var userHandler = require('../models/user');
var socialAccountHandler = require('../models/social_account');
var userActivityHandler = require('../models/user_activity');
var userDeviceHandler = require('../models/user_device');
var async = require('async');
var errorHandler = require('./error_handler');
var responseBuilder = require("./response_builder");
var extend = require('util')._extend;

function getUser(req, res){
    async.waterfall([
        function (callback){
            userHandler.getUser(req.params.uid,function(err, user){
                if (!user){
                    return callback({http_status: 404, message: "The user does not exist in our system."});
                } else {
                    return callback(err, user);
                }
            });
        },
        function(user, callback){
            socialAccountHandler.getUserAccounts(user, function(err, accounts){
                return callback(err, user, accounts);
            });
        },function(user, accounts, callback){
            var results = user.toJSON();
            results.accounts = accounts;
            callback(null, results);
        }
    ],function (err, results){
        if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, {user: results});
        };
    });
};

function setUser(req, res){
    async.waterfall([
        function (callback){
            userHandler.getUser(req.params.uid, function(err, user){
                if (!user){
                    callback({http_status: 404, message: "The user does not exist in our system."});
                } else {
                    callback(err, user);
                }
            });
        },
        function(user, callback){
            user.display_name = req.body.display_name;
            user.display_pic = req.body.display_pic;
            user.save(function (err){
                callback(err, user);
            })
        }
    ],function (err, user){
        if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, {user: user});
        };
    });
}

function getSocialAccounts(req, res){
    async.waterfall([
        function(callback){
            userHandler.getUser(req.params.uid, function(err, user){
                if (!user){
                    callback({http_status: 404, message: "The user does not exist in our system."});
                } else {
                    callback(err, user);
                }
            });
        },
        function (user, callback){
            socialAccountHandler.getUserAccounts(user,function(err, accounts){
                    return callback(err, user, accounts);
            });
        }
    ],function (err, user, accounts){
        if (err){
            errorHandler.handle(res, err);
        } else {
            var response = user.toJSON();
            response.accounts = accounts;
            responseBuilder.sendResponse(res, 200, {user: response});
        };
    });
};

function addSocialAccount(req, res){
    async.waterfall([
        function (callback){
            userHandler.getUser(req.params.uid, function(err, user){
                if (!user){
                    callback({http_status: 404, message: "The user does not exist in our system."});
                } else {
                    callback(err, user);
                }
            });
        },
        function(user, callback){
            socialAccountHandler.save(user, req.body.type, req.body.social_id, req.body.token, function(err, response){
                callback(err, user);
            });
        },
        function(user, callback){
            socialAccountHandler.getUserAccounts(user, function(err, accounts){
                callback(err, user, accounts);
            })
        }
    ],function (err, user, accounts){
        if (err){
            errorHandler.handle(res, err);
        } else {
            var response = user.toJSON();
            response.accounts = accounts;
            responseBuilder.sendResponse(res, 200, {user: response});
        };
    });
};

function updateLocation(req, res){
    async.waterfall([
        function (callback){
            userHandler.getUser(req.params.uid, function(err, user) {
                if (!user){
                    callback({http_status: 404, message: "The user does not exist in our system."});
                } else {
                    callback(err, user);
                }
            });
        },
        function(user, callback){
            userHandler.updateLocation(user, req.body.lat, req.body.long, req.body.altitude, function(err, user){
                callback(err, user);
            });
        }
    ],function (err, user){
        if (err){
            errorHandler.handle(res, err);
        } else {
            responseBuilder.sendResponse(res, 200, {user: user});
        };
    });
};

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
	getUser: getUser,
	setUser: setUser,
	getSocialAccounts: getSocialAccounts,
	addSocialAccount: addSocialAccount,
	updateLocation: updateLocation,
	getUserActivities: getUserActivities,
	registerUserDevice: registerUserDevice
}