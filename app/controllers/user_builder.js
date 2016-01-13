/**
 * Created by alan on 12/31/15.
 */
'use strict';

/* Main nodejs dependencies. */
var mongoose = require('mongoose');
var express = require('express');
var hat = require('hat');

/* Internal dependencies. */
var config = require('../config/config');
var UserHandler = require('../models/user');
var PhoneRegHandler = require('../models/phone_register');
var jwt = require('jsonwebtoken');

function formatNumber(numbers, split){
    var iterations = Math.floor(numbers.length/split);
    var output="";
    var start = 0;
    var end = start+split;
    for (var x=0;x<iterations;x++){
        if (output.length != 0){
            output += " ";
        }
        output += numbers.substring(start, end);
        start = end;
        end += split;
    }
    return output;
}

function generateRandomNumber(low, high, length){
    var numbers = new Array(length);
    for (var i = 0; i < numbers.length; i++) {
        numbers[i] = _randomIntInc(low,high)
    }
    return numbers.toString().replace(/,/g,"");
}

function _randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}



/********************************************************************************************************/
/*                                          Phone registry builder                                      */
/********************************************************************************************************/

/**
 * Builds a phone registry entity according to the role specified.
 * If the role of the phone entry does not correspond with a caller that its an admin, we return an error to the user.
 * @param req
 * @param res
 * @param cb
 */
function buildPhoneRegisterEntity(req, res, user, cb){
    var body = req.body;
    var caller = req.params.user_caller
    if (body.role == UserHandler.RoleTypes.Admin){
        if (!caller || caller.role != UserHandler.RoleTypes.Admin){
            cb({server:config.service_friendly_name, http_status:401, status:{ message: "You dont have permissions to execute such an action." }});
            return;
        }
    }
    var phoneRegister = new PhoneRegHandler.PhoneRegModel();
    phoneRegister.phone_number = body.phone_number;
    phoneRegister.code = generateRandomNumber(0,9,config.reg_code.lenght,config.reg_code.split);
    phoneRegister.role = body.role;
    if (user){
        phoneRegister.role = user.role;
        phoneRegister.uid = user.id ;
    }
    cb(null, phoneRegister);
}

/********************************************************************************************************/
/*                                          User account builder                                        */
/********************************************************************************************************/


/**
 * Method in charge of building a user entity based on a request DTO.
 * @param user A user that may be existing before.
 * @param requestDto
 * @param cb
 */
function buildUserEntity(req, res, user, phoneRegister, cb){
    // only and if its the first time, we set up the user role, otherwise we just bypass it.
    if (!user){
        user = new UserHandler.UserModel();
        user.role = phoneRegister.role;
        user.phone_number = phoneRegister.phone_number;
    }
    user.last_login = new Date();
    // TODO: Fill in the device info.
    if (cb != null){
        cb(null,user);
    }
}

/**
 * Method in charge of building a user entity based on a request DTO.
 * @param user A user that may be existing before.
 * @param requestDto
 * @param cb
 */
function buildUserToken(user, phoneRegister, cb){
    if (!user){
        user = new UserHandler.UserModel();
    }
    user.phone_number = phoneRegister.phone_number;
    if (cb != null){
        cb(user);
    }
}

/********************************************************************************************************/
/*                                          Account builder                                             */
/********************************************************************************************************/


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


/********************************************************************************************************/
/*                                              Method exports                                          */
/********************************************************************************************************/


module.exports = {
    buildAccount: buildAccount,
    buildFacebookAccount: buildFacebookAccount,
    buildTwitter: buildTwitter,
    buildInstagram:buildInstagram,
    buildUserEntity: buildUserEntity,
    buildAccountEntity: buildAccountEntity,
    attachAccountToUserEntity: attachAccountToUserEntity,
    buildPhoneRegisterEntity: buildPhoneRegisterEntity,
    generateRandomNumber: generateRandomNumber,
    formatNumber:formatNumber,
    randomIntInc: _randomIntInc,
}
