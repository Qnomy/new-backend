/**
 * Created by alan on 4/14/16.
 */

var UserHandler = require('../models/user');
var RepositoryHandler = require('../models/repository');
var SmsHandler = require('../service/sms');
var ObjectId = require('mongodb').ObjectID;
var TokenBuilder = require('./token_builder');
var ErrorHandler = require('./error_handler');
var ResponseBuilder = require("./response_builder");
var async = require('async');
var extend = require('util')._extend;

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
            SmsHandler.verifyNumber(req, res, req.body.phone_number, function (err, request_id){
                if (request_id.status != 0 && request_id.status != 10){
                    callback({http_status: 500, message: "There has been a problem with our sms provider, please try again soon."}, request_id);
                    // log error to logentries or something.
                } else {
                    callback(err, request_id);
                }
            });
            // callback(null, {request_id: "12345"});
        }

    ],function (err, request_id){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            ResponseBuilder.sendResponse(res, 200, {"request_id": request_id.request_id});
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
                user.save(function(err) {
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
            ResponseBuilder.sendResponse(res, 200, tokens)
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
            UserHandler.UserModel.findOne({_id: new ObjectId(req.params.id)}, function(err, user){
                if (!user){
                    callback({http_status: 404, message: "The user does not exist in our system."});
                } else {
                    callback(err, user);
                }
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
            ResponseBuilder.sendResponse(res, 200, null);
        };
    });
};