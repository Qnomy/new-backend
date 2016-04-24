/**
 * Created by alan on 4/14/16.
 */

var UserHandler = require('../models/user');
var RepositoryHandler = require('../models/repository');
var SmsHandler = require('../service/sms');
var ObjectId = require('mongodb').ObjectID;
var TokenBuilder = require('./token_builder');
var ErrorHandler = require('./error_handler');

var async = require('async');

var output = module.exports;

/**
 * input: post: body: {"phone_number": ""}
 * output: {"request_id": "reqID"}
 * @param req
 * @param res
 */
output.register = function(req, res){
    async.waterfall([
        function (callback){
            // TODO: Change the body to something configurable.
            SmsHandler.verifyNumber(req, res, req.body.phone_number, function (err, request_id){
                if (request_id.status != 0){
                    callback({http_status: 500, message: "There has been a problem with our sms provider, please try again soon."}, request_id);
                } else {
                    callback(err, request_id);
                }
            });
        }
    ],function (err, request_id){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).json({"request_id": request_id.request_id});
            res.end();
        }
    });
};

/**
 * input: post: body: {"code": "", x"request_id":"", "phone_number":""}
 * output: {"token": ""}
 * @param req
 * @param res
 */
output.verify = function(req, res){
    async.waterfall([
        function (callback){
            // verify that the sms is correct.
            SmsHandler.verifyCode(req, res, req.body.code, req.body.request_id, function (err){
                callback(err);
            });
        },
        function(callback){
            // find a user.
            UserHandler.UserModel.findOne({phone_number:req.body.phone_number}, function(err, user){
                callback(err, user);
            });
        },
        function(user, callback){
            if (user) {
                callback(null, user);
            } else {
                user = new UserHandler.UserModel();
                user.role = UserHandler.RoleTypes.Public;
                user.phone_number = req.body.phone_number;
                user.save(function(err){
                    callback(err, user);
                });
            };
        },
        function(user, callback){
            // build the jwt token with the role information and the user id.
            TokenBuilder.buildTokens(user, function(err, tokens){
                callback(err, user, tokens);
            });
        }
    ],function (err, user, tokens){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            tokens.uid = user.id;
            res.status(200).json(tokens);
            res.end();
        };
    });
};

/**
 * input: post: body: {"code": "", "request_id":"", "uid":""}
 * output: {"token": ""}
 * @param req
 * @param res
 */
output.init_account = function(req, res){
    async.waterfall([
        function (callback){
            // find a user.
            UserHandler.UserModel.find({id:req.body.id}, function(err, user){
                callback(err, user);
            });
        },
        function(user, callback){
            if (!user){
                callback({code: 2, message: "There was no user found."});
            } else{
                // add a new account to the user.
                user.display_name = body.display_name;
                user.display_pic = body.display_pic;
                UserHandler.save(user, req.body.type, req.body.social_id, req.body.token, req.body.meta, function(err, user){
                    callback(err, user);
                });
            }
        }
    ],function (err, user){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).json({});
            res.end();
        };
    });
};


/**
 * headers: Authorization:
 * input: post: body: {"type": 1|2|3, "social_id":"", "token":"", "meta":"WHATEVER YOU WANT"}
 * output: {}
 * @param req
 * @param res
 */
output.post_account = function(req, res){
    async.waterfall([
        function (callback){
            UserHandler.UserModel.findOne({_id:new ObjectId(req.params.uid)}, function(err, user){
                callback(err, user);
            });
        },
        function(user, callback){
            if (!user){
                callback({code: 2, message: "There was no user found."});
            } else{
                UserHandler.save(user, req.body.type, req.body.social_id, req.body.token, req.body.meta, function(err, user){
                    callback(err, user);
                });
            }
        }
    ],function (err, user){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).json({});
            res.end();
        };
    });
};

/**
 * url: /v1/auth/:uid method post
 * {"display_name": "", "display_pic":""}
 *
 * @param req
 * @param res
 */

output.post = function(req, res){
    async.waterfall([
        function (callback){
            UserHandler.UserModel.findOne({_id:new ObjectId(req.params.uid)}, function(err, user){
                callback(err, user);
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
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).json({uid: user.id});
            res.end();
        };
    });
}

/**
 * headers: Authorization:
 * input: post: body: {"code": "", "request_id":"", "phone_number":""}
 * output: {"token": ""}
 * @param req
 * @param res
 */
output.get = function(req, res){
    async.waterfall([
        function (callback){
            UserHandler.UserModel.findOne({_id:new ObjectId(req.params.uid)},function(err, user){
                callback(err, user);
            });
        }
    ],function (err, user){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).json(user);
            res.end();
        };
    });
};

/**
 * headers: Authorization:
 * input: post: body: {"code": "", "request_id":"", "phone_number":""}
 * output: {"token": ""}
 * @param req
 * @param res
 */
output.get_accounts = function(req, res){
    async.waterfall([
        function (callback){
            UserHandler.UserModel.findOne({_id:new ObjectId(req.params.uid)},function(err, user){
                if (!user){
                    callback({http_status: 404, message: "The user does not exists in our system."});
                } else{
                    callback(err, user);
                }
            });
        }
    ],function (err, user){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).json(user.accounts);
            res.end();
        };
    });
};