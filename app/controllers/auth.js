/**
 * Created by alan on 4/14/16.
 */

var UserHandler = require('../models/user');
var SmsHandler = require('../service/sms');

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
                callback(err, request_id);
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
 * input: post: body: {"code": "", "request_id":"", "phone_number":""}
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
            UserHandler.findUserBy({phone_number:req.body.phone_number}, function(err, user){
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
                UserHandler.saveUserEntity(user, function(err, user){
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
 * headers: Authorization:
 * input: post: body: {"code": "", "request_id":"", "phone_number":""}
 * output: {"token": ""}
 * @param req
 * @param res
 */
output.post_account = function(req, res){
    async.waterfall([
        function (callback){
            UserHandler.findUserBy({_id: req.params.uid}, function(err, user){
                callback(err, user);
            })
        },
        function(user, callback){
            if (!user){
                callback({code: 2, message: "There was no user found."});
            } else{
                // add a new account to the user.
                UserHandler.saveAccount(user, req.body.type, req.body.social_id, req.body.token, req.body.meta, function(err, user){
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
//
//output.get_account = function(req, res){
//    async.waterfall([
//        function (callback){
//            UserHandler.findUserBy({_id: req.params.uid}, function(err, user){
//                callback(err, user);
//            })
//        },
//        function(err, user, callback){
//            if (!user){
//                callback({code: 2, message: "There was no user found."});
//            } else{
//                // add a new account to the user.
//                UserHandler.post_(user, req.body.type, req.body.social_id, req.body.token, req.body.meta, function(err, account){
//                    callback(err, user, account);
//                });
//            }
//        }
//    ],function (err, user, account){
//        if (err){
//            ErrorHandler.handle(res, err);
//        } else {
//            res.status(200).json({});
//            res.end();
//        };
//    });
//};
