/**
 * Created by alan on 12/17/15.
 */
'use strict';

/* Main nodejs dependencies. */
var express = require('express');
var hat = require('hat');

/* Internal dependencies. */
var producer = require('../../config/kafka');
var config = require('../../config/config');
var ErrorHandler = require('../error_handler');
var CredentialsHandler = require('../../models/credential');
var crypto = require('crypto');
var TokenBuilder = require('../token_builder');
var UserBuilder = require('../user_builder');
var PhoneRegisterHandler = require('../../models/phone_register');
var UserHandler = require('../../models/user');
var SmsHandler = require('../../service/sms');
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

output.get = function(req, res){
    async.waterfall([
        function(callback){
            CredentialsHandler.findBy({email: req.params.email}, function (err, credential){
                if (!credential){
                    err = {server:config.service_friendly_name, http_status:404, status:{ message: "Credential not found."}};
                    callback(err);
                    return;
                }
                var credentialJson = credential.toJSON();
                delete credentialJson.password;
                callback(err, credentialJson);
            });
        }
    ], function(err, credentialJson){
        res.status(200).json(credentialJson);
    });
}

/**
 * Login and creates a user into the system.
 * @param req
 * @param res
 */
output.login = function (req, res){
    async.waterfall([
        function(callback) {
            var body = req.body;
            var password = crypto.createHash('md5').update(body.password).digest('hex');
            var email = body.email;
            CredentialsHandler.findBy({email: email, password: password}, function (err, credential){
                if (!credential){
                    err = {server:config.service_friendly_name, http_status:404, status:{ message: "Invalid username or password."}};
                    callback(err);
                    return;
                }
                callback(err, credential);
            });
        },
        function (credential, callback){
            var phoneRegister = UserBuilder.buildPhoneRegisterEntity(credential.phone_number);
            PhoneRegisterHandler.savePhoneRegEntity(req, res, phoneRegister, function(err, phoneRegister){
                callback(err, credential, phoneRegister);
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
    ], function (err, credential, phoneRegister, data){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            TokenBuilder.buildCredentialTokens(phoneRegister.rnd,UserHandler.RoleTypes.Admin, function (err, token){
                res.status(200).json(token);
                res.end();
            });
        }
    });
}