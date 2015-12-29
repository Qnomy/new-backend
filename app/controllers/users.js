/**
 * Created by alan on 12/17/15.
 */
'use strict';

/* Main nodejs dependencies */

var mongoose = require('mongoose');

var producer = require('../config/kafka');

var config = require('../config/config');
var express = require('express');
var hat = require('hat');
var RoleTypes = require('../models/user').RoleTypes;

var UserModel = require('../models/user').UserModel;
var AccountModel = require('../models/user').AccountModel;
var AccountTypes = require('../models/user').AccountTypes;

var facebookService = require('../service/facebook');
var accountBuilder = require('./helpers/account_builder');


/**
 * Controller method for logging in from a social network.
 * @param req
 * @param res
 * @param accountType
 */
function loginSocialController(req, res, accountType){
    findUserBy({ 'accounts.type': accountType, 'accounts.social_id': req.body.social_id }, function (user){
        buildUserEntity(user, req.body, function (user){
            user.role = RoleTypes.Public;
            buildAccountEntity(accountType, req.body, function (account){
                validateSocialAccount(req, res, account, function (account){
                    attachAccountToUserEntity(user, account, function (user){
                        saveUserEntity(user, function (err, user){
                            logActivity(config.kafka.topics.user_login_topic, user.last_login, req, function (){
                                responseUser(req, res, err, user);
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
    findUserBy({ 'token': req.body.token }, function (user){
        validateToken(req, res, user, {"token_refresh" : req.body.token_refresh}, false, function (user){
            buildUserEntity(user, user, function (user){
                saveUserEntity(user, function (err, user){
                    responseUser(req, res, err, user);
                });
            });
        });
    });
}

function getUserController(req, res, criteria){
    findUserBy(criteria, function (user){
        validateOwnership(req, res, user, function (user){
            responseFullUser(req, res, null, user);
        });
    });
}

module.exports = {
    login_social: loginSocialController,
    refresh_token: refreshTokenController,
    get_user: getUserController

}