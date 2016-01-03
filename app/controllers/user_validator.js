/**
 * Created by alan on 12/31/15.
 */

/* Main nodejs dependencies. */
var mongoose = require('mongoose');
var express = require('express');
var hat = require('hat');

/* Internal dependencies. */
var UserHandler = require('../models/user');
var facebookService = require('../service/facebook');

function validateToken(req, res, user, criteria, validateExpiration, cb){
    // if the user does not exists, just return a 400 bad request.
    if (user == null){
        res.status(400).json({server:"scarlett", http_status:400, status:{ message: "The access token or refresh token are not valid." }});
        res.end();
        return;
    }

    // if the object does not match the criteria, just return a 400 bad request.
    for (var property in criteria){
        if (criteria.hasOwnProperty(property)){
            if (user[property] != criteria[property]){
                res.status(400).json({server:"scarlett", http_status:400, status:{ message: "The access token or refresh token are not valid." }});
                res.end();
                return;
            }
        }
    }

    // if the user requests us to validate the token expiration time as well.
    if (validateExpiration){
        if ((new Date()).getTime() > user.token_expiration){
            res.status(401).json({server:"scarlett", http_status:401, status:{ message: "The access token or refresh token are not valid." }});
            res.end();
            return;
        }
    }

    // call the callback indicating that we are done here.
    if (cb){
        cb(user);
    }
}



/**
 * Internal function that validates the token given by parameter.
 * @param user
 * @param token_attr
 * @param token
 * @param cb
 */
function validateOwnership(req, res, user, cb){
    if (user == null){
        cb(user);
        return;
    }
    if (req.params.user_caller.role == UserHandler.RoleTypes.Admin || req.params.user_caller.id == user.id){
        cb(user);
        return;
    }
    res.status(401).json({server:"scarlett", http_status:401, status:{ message: "You dont have permissions to view this user." }});
    res.end();
    return;
}

/**
 * Validates the user account against all the social networks.
 * @param account
 * @param cb
 */
function validateSocialAccount(req, res, account, cb){
    if (account.type == UserHandler.AccountTypes.Facebook){
        facebookService.validate(account.token, function (err){
            if (err){
                res.status(err.status).json({server:"scarlett", http_status:err.status, status:{ message: "There was an error validating your request against facebook" }});
                res.end();
                return;
            }
            if (cb){
                cb(account);
            }
        })
    } else if (account.type == UserHandler.AccountTypes.Twitter){

    }
}

module.exports = {
    validateToken: validateToken,
    validateOwnership: validateOwnership,
    validateSocialAccount: validateSocialAccount
}