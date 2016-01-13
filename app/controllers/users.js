/**
 * Created by alan on 12/17/15.
 */
'use strict';

/* Main nodejs dependencies. */
var express = require('express');
var hat = require('hat');

/* Internal dependencies. */
var producer = require('../config/kafka');
var config = require('../config/config');
var UserHandler = require('../models/user');
var PhoneRegisterHandler = require('../models/phone_register');
var SmsHandler = require('../service/sms');

var TokenBuilder = require('./token_builder');
var UserBuilder = require('./user_builder');
var UserValidator = require('./user_validator');
var UserResponseBuilder = require('./user_response_builder');
var ErrorHandler = require('./error_handler');

var async = require('async');

/**
 * Logs an activity into kafka topics.
 * @param topic
 * @param etime
 * @param req
 * @param cb
 */
function logActivity(topic, etime, object, req, cb){
    var message = JSON.stringify({etime: etime, object: object, header: req.headers, body: req.body, params: req.params});
    producer.send([{topic: topic, messages: message}], function (err, data){
        cb();
    });
}

/**
 * Registers a phone number and sends a message to kafka.
 * @param req
 * @param res
 */
function registerController(req, res){
    async.waterfall([
        function(callback){
            UserHandler.findUserBy(req, res, { phone_number: req.body.phone_number }, function (err, user){
                callback(err, user);
            })
        },
        function (user, callback){
            UserBuilder.buildPhoneRegisterEntity(req, res, user, function(err, phoneRegister){
                callback(err, user, phoneRegister);
            });
        },
        function (user, phoneRegister, callback){
            PhoneRegisterHandler.savePhoneRegEntity(req, res, phoneRegister, function(err, phoneRegister){
                callback(err, user, phoneRegister);
            });
        },
        function (user, phoneRegister, callback){
            var code = UserBuilder.formatNumber(phoneRegister.code, config.reg_code.split);
            SmsHandler.sendMessage(req, res, phoneRegister.phone_number, "Your activation code is: " + code, function (err, data){
                callback(err, user, phoneRegister, data);
            });
        },
        function(user, phoneRegister, data, callback) {
            logActivity(config.kafka.topics.phone_register_topic, phoneRegister.createdAt, phoneRegister, req, function () {
                callback(null, user, phoneRegister, data);
            });
        }
    ],function (err, user, phoneRegister, data){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            UserResponseBuilder.responsePhoneRegister(req, res, phoneRegister);
        }
    });
}

/**
 * Login and creates a user into the system.
 * @param req
 * @param res
 */
function loginController(req, res){
    async.waterfall([
        function(callback) {
            PhoneRegisterHandler.findPhoneRegBy({
                code: req.body.code,
                phone_number: req.body.phone_number
            }, function (err, phoneRegister) {
                if (!phoneRegister){
                    err = {server:config.service_friendly_name, http_status:404, status:{ message: "There was a problem trying to find the phoneReg, please try again later."}};
                    callback(err);
                    return;
                }
                callback(err, phoneRegister);
            })
        },
        function (phoneRegister, callback) {
            UserHandler.findUserBy(req, res, {_id: phoneRegister.uid}, function (err, user) {
                callback(err, user, phoneRegister);
            });
        },
        function (user, phoneRegister, callback) {
            UserBuilder.buildUserEntity(req, res, user, phoneRegister, function(err, user) {
                callback(err, user, phoneRegister);
            });
        },
        function (user, phoneRegister, callback) {
            UserHandler.saveUserEntity(user, function(err, user){
                callback(err, user, phoneRegister);
            });
        },
        function (user, phoneRegister, callback) {
            logActivity(config.kafka.topics.user_login_topic, user.last_login, { user: user, phoneReg: phoneRegister } , req, function (){
                callback(null, user, phoneRegister);
            });
        },

    ], function (err, user, phoneRegister){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            TokenBuilder.buildTokens(user, function (err, tokens){
                res.status(200).json(tokens);
                res.end();
            });
        }
    });
}

/**
 * Controller method for logging in from a social network.
 * @param req
 * @param res
 * @param accountType
 */
function addSocialAccountController(req, res, accountType){
    UserHandler.findUserByOrResult({ 'accounts.type': accountType, 'accounts.social_id': req.body.social_id }, function (user){
        UserBuilder.buildUserEntity(user, req.body, function (user){
            user.role = UserHandler.RoleTypes.Public;
            UserBuilder.buildAccountEntity(accountType, req.body, function (account){
                UserValidator.validateSocialAccount(req, res, account, function (account){
                    UserBuilder.attachAccountToUserEntity(user, account, function (user){
                        UserHandler.saveUserEntity(user, function (err, user){
                            logActivity(config.kafka.topics.user_login_topic, user.last_login, user, req, function (){
                                UserResponseBuilder.responseUser(req, res, err, user);
                            });
                        });
                    });
                })
            });
        });
    });
};

/**
 * Controller method for refreshing a token.
 * @param req
 * @param res
 */
function refreshTokenController(req, res){
    UserHandler.findUserBy({ 'token': req.body.token }, function (user){
        UserValidator.validateToken(req, res, user, {"token_refresh" : req.body.token_refresh}, false, function (user){
            UserBuilder.buildUserEntity(user, user, function (user){
                UserHandler.saveUserEntity(user, function (err, user){
                    UserResponseBuilder.responseUser(req, res, err, user);
                });
            });
        });
    });
}

/**
 * Method that gets a user based on a criteria.
 * @param req
 * @param res
 * @param criteria The criteria object that filters the user we are looking for.
 */
function getUserController(req, res, criteria){
    UserHandler.findUserBy(criteria, function (user){
        UserValidator.validateOwnership(req, res, user, function (user){
            UserResponseBuilder.responseFullUser(req, res, null, user);
        });
    });
}

module.exports = {
    register: registerController,
    login: loginController,
    addSocialAccount: addSocialAccountController, // TODO: Fix this crap
    refreshToken: refreshTokenController,
    getUser: getUserController

}