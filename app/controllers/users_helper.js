/**
 * Created by alan on 12/27/15.
 */

var mongoose = require('mongoose');

var express = require('express');
var hat = require('hat');

var producer = require('../config/kafka');
var config = require('../config/config');
var UserHandler = require('../models/user');

var facebookService = require('../service/facebook');

function buildAccount(accountType, requestBody){
    if (accountType == UserHandler.AccountTypes.Facebook){
        this.buildFacebook(requestBody);
    } else if (accountType == UserHandler.AccountTypes.Twitter){
        this.buildTwitter(requestBody);
    } else if (accountType == UserHandler.AccountTypes.Instagram){
        this.buildInstagram(requestBody);
    }
}

function buildFacebookAccount(requestBody){
    return {
        token_xpires: requestBody.expires,
        gender: requestBody.gender,
        email: requestBody.email,
        birthday: requestBody.birthday,
        age_range: requestBody.age_range,
        hometown: requestBody.hometown,
        location: requestBody.location,
        timezone: requestBody.timezone
    };
}

function buildTwitter(requestBody){
    return {
        token_secret: requestBody.token_secret,
        name: requestBody.name,
        email: requestBody.email,
        location: requestBody.location,
        timezone: requestBody.timezone,
        screen_name: requestBody.screen_name,
        followers_count: requestBody.followers_count,
        faviourites_count: requestBody.faviourites_count,
        friends_count: requestBody.friends_count,
        statuses_count: requestBody.statuses_count
    };
}

function buildInstagram(requestBody){
    return { };
}

/**
 * Method in charge of building a user entity based on a request DTO.
 * @param user A user that may be existing before.
 * @param requestDto
 * @param cb
 */
function buildUserEntity(user, requestDto, cb){
    if (user == null){
        user = new UserHandler.UserModel();
    }
    user.latitude = requestDto.latitude;
    user.longitude = requestDto.longitude;
    user.token = hat();
    user.token_refresh = hat();
    user.token_expiration = (new Date()).getTime() + config.tokenValidTime;
    user.display_name = requestDto.display_name;
    user.display_pic = requestDto.display_pic;
    user.last_login = (new Date()).getTime();
    if (cb != null){
        cb(user);
    }
}

/**
 * Method in charge of building an account entity.
 * @param accountType
 * @param requestBody
 * @param cb
 */
function buildAccountEntity(accountType, requestBody, cb){
    var account = new UserHandler.AccountModel();
    account.type = accountType;
    account.social_id = requestBody.social_id;
    account.token = requestBody.token;
    account.meta = buildAccount(accountType, requestBody);
    if (cb != null){
        cb(account);
    }
}


/**
 * Registers an account to the user passed by parameter.
 * @param user The user that will own the account.
 * @param account The account that we want to attach to the user.
 * @param cb A callback method that will be used after the account is attached to the user.
 */
function attachAccountToUserEntity(user, account, cb){
    if (user.accounts){
        var accountIndex = -1;
        for (var accIdx in user.accounts){
            var currentAccount = user.accounts[accIdx];
            if (account.type == currentAccount.type){
                accountIndex = accIdx;
                break;
            }
        }
        if (accountIndex > -1){
            user.accounts[accountIndex].remove();
        }
        user.accounts.push(account);
    }
    if (cb){
        cb(user);
    }
}


/**
 * Method in charge of finding a user based on the criteria passed by parameter.
 * @param criteria The criteria object passed by parameter.
 * @param cb The callback method that will be executed after the search finishes.
 */
function findUserBy(criteria, cb){
    UserHandler.UserModel.findOne(criteria,
        function (err, user){
            if (err){
                res.status(500).json({server:"scarlett", http_status:500, status:{ message: "There was a problem trying to find the user, please try again later." }});
                return;
            }
            if (cb){
                cb(user);
            }
        }
    )
}

/**
 * Saves the user into the data store.
 * @param user The user we are trying to store.
 * @param cb The callback method that will be executed after the store.
 */
function saveUserEntity(user, cb){
    user.save(function(err){
        if (err){
            res.status(500).json({server:"scarlett", http_status:500, status:{ message: "There was a problem saving the user, please try again later." }});
            return;
        }
        if (cb){
            cb(err, user);
        }
    })
}

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
    }
}

/**
 * Response the created user entity to the client.
 * @param req The request object from where we need the information from the request.
 * @param res The response object used to response the information to the client.
 * @param err An error variable to be evaluated to see what to answer to the client.
 * @param user The user we stored previously.
 */
function responseUser(req, res, err, user, loginType){
    if (err){
        res.status(500).json({server:"scarlett", http_status:500, status:{ message: "There was a problem saving the user, please try again later." }});
    } else {
        if (!user){
            res.status(404).json({server:"scarlett", http_status:404, status:{ message: "The user was not found." }});
        } else {
            res.status(200).json({
                uid: user.id,
                token: user.token,
                token_refresh: user.token_refresh,
                name: user.display_name,
                pic: user.display_pic,
                login_type: loginType
            });
        }
    }
    res.end();
}

/**
 * Response the created user entity to the client.
 * @param req The request object from where we need the information from the request.
 * @param res The response object used to response the information to the client.
 * @param err An error variable to be evaluated to see what to answer to the client.
 * @param user The user we stored previously.
 */
function responseFullUser(req, res, err, user){
    if (err){
        res.status(500).json({server:"scarlett", http_status:500, status:{ message: "There was a problem saving the user, please try again later." }});
    } else {
        if (!user){
            res.status(404).json({server:"scarlett", http_status:404, status:{ message: "The user was not found." }});
        } else {
            res.status(200).json(user);
        }
    }
    res.end();
    return;
}

/**
 * Logs an activity into kafka topics.
 * @param sentToTopic
 * @param etime
 * @param req
 * @param cb
 */
function logActivity(sentToTopic, etime, req, cb){
    var message = JSON.stringify({etime: etime, header: req.headers, body: req.body, params: req.params});
    producer.send([{topic: sentToTopic, messages: message}], function (err, data){
        cb();
    });
}