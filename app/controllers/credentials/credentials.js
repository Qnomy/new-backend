/**
 * Created by alan on 12/17/15.
 */
'use strict';

/* Main nodejs dependencies. */
var express = require('express');
var hat = require('hat');

/* Internal dependencies. */
var producer = require('../config/kafka');
var config = require('../../config/config');
var ErrorHandler = require('./error_handler');
var CredentialsHandler = require('../../models/credential');
var crypto = require('crypto').createHash('md5');
var TokenBuilder = require('../token_builder');

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
 * Login and creates a user into the system.
 * @param req
 * @param res
 */
function loginController(req, res){
    async.waterfall([
        function(callback) {
            var body = req.body;
            var password = crypto.update(body.password).digest('hex');
            var email = body.email;
            CredentialsHandler.findBy({email: email, password: password}, function (err, credential){
                if (!credential){
                    err = {server:config.service_friendly_name, http_status:404, status:{ message: "Invalid username or password."}};
                    callback(err);
                    return;
                }
                callback(err, credential);
            });
        }
    ], function (err, credential){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            TokenBuilder.buildCredentialTokens(credential, function (err, token){
                res.status(200).json(token);
                res.end();
            });
        }
    });
}

module.exports = {
    login: loginController,
}