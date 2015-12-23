/**
 * Created by alan on 12/17/15.
 */
'use strict';

/* Main nodejs dependencies */

var mongoose = require('mongoose');
var config = require('../config/config');
var producer = require('../config/kafka');
var express = require('express');
var hat = require('hat');
var UserModel = require('../models/user').UserModel;
var AccountModel = require('../models/user').AccountModel;
var AccountTypes = require('../models/user').AccountTypes;
var RoleTypes = require('../models/user').RoleTypes;

/* Middleware definitions */
var socialFacebookValidationMiddleware = require('../middlewares/social_facebook_validation');
var socialTwitterValidationMiddleware = require('../middlewares/social_twitter_validation');
var socialInstagramValidationMiddleware = require('../middlewares/social_instagram_validation');

var authorizationMiddleware = require('../middlewares/authorization');

/* Middleware definitions aggregations */
var socialFacebookMiddlewares=[socialFacebookValidationMiddleware.validate_schema, socialFacebookValidationMiddleware.validate_user_existance_by_token];
var socialTwitterMiddlewares=[socialTwitterValidationMiddleware.validate_schema, socialTwitterValidationMiddleware.validate_user_existance_by_token];
var socialInstagramMiddlewares=[socialInstagramValidationMiddleware.validate_schema, socialInstagramValidationMiddleware.validate_user_existance_by_token];

var authorizationMiddlewareList = [authorizationMiddleware.token_loader, authorizationMiddleware.caller_loader, authorizationMiddleware.token_access_validation];

/**
 * Internal function that validates the token given by parameter.
 * @param user
 * @param token_attr
 * @param token
 * @param cb
 */
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

function validateOwnership(req, res, user, cb){
    if (user == null){
        cb(user);
        return;
    }
    if (req.params.user_caller.role == RoleTypes.Admin || req.params.user_caller.id == user.id){
        cb(user);
        return;
    }
    res.status(401).json({server:"scarlett", http_status:401, status:{ message: "You dont have permissions to view this user." }});
    res.end();
    return;

}

/**
 * Method in charge of finding a user based on the criteria passed by parameter.
 * @param criteria The criteria object passed by parameter.
 * @param cb The callback method that will be executed after the search finishes.
 */
function findUserBy(criteria, cb){
    UserModel.findOne(criteria,
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
function saveUser(user, cb){
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
 * Registers an account to the user passed by parameter.
 * @param user The user that will own the account.
 * @param account The account that we want to attach to the user.
 * @param cb A callback method that will be used after the account is attached to the user.
 */
function registerAccount(user, account, cb){
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
 * Method in charge of building a user entity based on a request DTO.
 * @param user A user that may be existing before.
 * @param requestDto
 * @param cb
 */
function buildUserEntity(user, requestDto, cb){
    if (user == null){
        user = new UserModel();
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
    var account = new AccountModel();
    account.type = accountType;
    account.social_id = requestBody.social_id;
    account.token = requestBody.token;
    if (accountType == AccountTypes.Facebook){
        account.meta = {
            refresh_token: requestBody.refresh_token,
            expires: requestBody.expires,
            gender: requestBody.gender,
            email: requestBody.email,
            birthday: requestBody.birthday,
            age_range: requestBody.age_range,
            hometown: requestBody.hometown,
            location: requestBody.location,
            timezone: requestBody.timezone
        }
    }
    if (cb != null){
        cb(account);
    }
}

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
                registerAccount(user, account, function (user){
                    saveUser(user, function (err, user){
                        logActivity(config.kafka.topics.user_login_topic, user.last_login, req, function (){
                            responseUser(req, res, err, user);
                        });
                    });
                });
            });
        });
    });
};

function logActivity(sentToTopic, etime, req, cb){
    var message = JSON.stringify({etime: etime, header: req.headers, body: req.body, params: req.params});
    producer.send([{topic: sentToTopic, messages: message}], function (err, data){
        cb();
    });
}

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
                saveUser(user, function (err, user){
                    responseUser(req, res, err, user);
                })
            })
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

/* field dependencies */
var router = express.Router();

// Login methods.
router.post('/login-social/facebook', socialFacebookMiddlewares, function (req, res){
    loginSocialController(req, res, AccountTypes.Facebook);
});

router.post('/login-social/twitter', socialTwitterMiddlewares, function (req, res){
    loginSocialController(req, res, AccountTypes.Twitter);
});

router.post('/login-social/instagram', socialInstagramMiddlewares, function (req, res){
    loginSocialController(req, res, AccountTypes.Instagram);
});

// Gets a user by its identifier and by its account type and social id.
router.get('/user/:uid', authorizationMiddlewareList, function (req, res){
    getUserController(req, res, { '_id': req.params.uid });
});

router.get('/user/:accountType/:socialId', authorizationMiddlewareList, function (req, res){
    getUserController(req, res, { 'accounts.social_id': req.params.socialId, 'accounts.type': req.params.accountType });
});

// Token management.
router.post('/refresh-token', refreshTokenController);

module.exports = router;