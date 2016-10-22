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
var CredentialsHandler = require('../models/credential');
var SmsHandler = require('../service/sms');

var TokenBuilder = require('./token_builder');
var UserBuilder = require('./user_builder');
var ErrorHandler = require('./error_handler');

var async = require('async');

var output = module.exports;

/**
 * Logs an activity into kafka topics.
 * @param topic
 * @param etime
 * @param req
 * @param cb
 */
output.logActivity = function(topic, etime, object, req, cb){
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
output.register = function(req, res){
    async.waterfall([
        function (user, callback){
            var phoneRegister = UserBuilder.buildPhoneRegisterEntity(req.body.phone_number);
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
            output.logActivity(config.kafka.topics.phone_register_topic, phoneRegister.createdAt, phoneRegister, req, function () {
                callback(null, user, phoneRegister, data);
            });
        }
    ],function (err, user, phoneRegister, data){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            TokenBuilder.buildCredentialTokens(phoneRegister.rnd, UserHandler.RoleTypes.Public, function (err, token){
                res.status(200).json(token);
                res.end();
            });
        }
    });
}

/**
 * Login and creates a user into the system.
 * @param req
 * @param res
 */
output.verify = function (req, res){
    async.waterfall([
        function(callback) {
            var payload = req.params.token_payload;
            PhoneRegisterHandler.findPhoneRegBy({
                code: req.body.code,
                rnd: payload.rnd
            }, function (err, phoneRegister) {
                if (!phoneRegister){
                    err = {server:config.service_friendly_name, http_status:404, status:{ message: "There was a problem trying to find the phoneReg, please try again later."}};
                    callback(err);
                    return;
                }
                callback(err, payload, phoneRegister);
            });
        },
        function (payload, phoneRegister, callback) {
            UserHandler.findUserBy(req, res, {phone_number: phoneRegister.phone_number}, function (err, user) {
                callback(err,payload,  user, phoneRegister);
            });
        },
        function (payload, user, phoneRegister, callback){
            // if there is no user, and the role of the token is an admin role, then we need to load a potential credential id to link it with the user.
            if (!user && payload.role == UserHandler.RoleTypes.Admin){
                CredentialsHandler.findBy({phone_number: phoneRegister.phone_number}, function (err, credential){
                    callback(err, credential, payload, user, phoneRegister);
                });
            } else {
                callback(null, null, payload, user, phoneRegister);
            }
        }
        ,
        function (credential, payload, user, phoneRegister, callback) {
            UserBuilder.buildUserEntity(credential, payload, user, phoneRegister, function(err, user) {
                callback(err, credential, user, phoneRegister);
            });
        },
        function (credential, user, phoneRegister, callback) {
            UserHandler.saveUserEntity(user, function(err, user){
                callback(err, credential, user, phoneRegister);
            });
        },
        function (credential, user, phoneRegister, callback) {
            output.logActivity(config.kafka.topics.user_login_topic, user.last_login, { user: user, phoneReg: phoneRegister } , req, function (){
                callback(null,credential, user, phoneRegister);
            });
        }
    ], function (err, credential, user, phoneRegister){
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

output.find = function(req, res){
    async.waterfall([
        function(callback) {
            var criteria = {}
            for (var param in req.query){
                var paramValue = req.query[param];
                criteria[param] = paramValue;
            }
            UserHandler.findUsersBy(criteria, function(err, users){
                if (err){
                    callback(err);
                    return;
                }
                callback(err, users);
            });
        }
    ], function (err, users){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).json(users);
        }
    });
};

/**
 * Method that gets a user based on a criteria.
 * @param req
 * @param res
 * @param criteria The criteria object that filters the user we are looking for.
 */
output.get = function (req, res, criteria){
    async.waterfall([
        function(callback) {
            UserHandler.findUserBy(criteria, function(err, user){
                if (err){
                    callback(err);
                    return;
                }
                callback(err, user);
            });
        }
    ], function (err, user){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).json(user);
        }
    });
}
