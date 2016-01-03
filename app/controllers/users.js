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
var UserDao = require('../models/user');

var UserBuilder = require('./user_builder');
var UserValidator = require('./user_validator');
var UserResponseBuilder = require('./user_response_builder');

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
 * Controller method for logging in from a social network.
 * @param req
 * @param res
 * @param accountType
 */
function loginSocialController(req, res, accountType){
    UserDao.findUserByOrResult({ 'accounts.type': accountType, 'accounts.social_id': req.body.social_id }, function (user){
        UserBuilder.buildUserEntity(user, req.body, function (user){
            user.role = UserHandler.RoleTypes.Public;
            UserBuilder.buildAccountEntity(accountType, req.body, function (account){
                UserValidator.validateSocialAccount(req, res, account, function (account){
                    UserBuilder.attachAccountToUserEntity(user, account, function (user){
                        UserDao.saveUserEntity(user, function (err, user){
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


//      internet bezeq ben leumi.
//      166 bezeq.

/**
 * Controller method for refreshing a token.
 * @param req
 * @param res
 */
function refreshTokenController(req, res){
    UserDao.findUserBy({ 'token': req.body.token }, function (user){
        UserValidator.validateToken(req, res, user, {"token_refresh" : req.body.token_refresh}, false, function (user){
            UserBuilder.buildUserEntity(user, user, function (user){
                UserDao.saveUserEntity(user, function (err, user){
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
    UserDao.findUserBy(criteria, function (user){
        UserValidator.validateOwnership(req, res, user, function (user){
            UserResponseBuilder.responseFullUser(req, res, null, user);
        });
    });
}

module.exports = {
    login_social: loginSocialController,
    refresh_token: refreshTokenController,
    get_user: getUserController

}