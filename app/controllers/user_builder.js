/**
 * Created by alan on 12/31/15.
 */
'use strict';

/* Main nodejs dependencies. */
var mongoose = require('mongoose');
var express = require('express');
var hat = require('hat');

/* Internal dependencies. */
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

module.exports = {
    buildAccount: buildAccount,
    buildFacebookAccount: buildFacebookAccount,
    buildTwitter: buildTwitter,
    buildInstagram:buildInstagram,
    buildUserEntity: buildUserEntity,
    buildAccountEntity: buildAccountEntity,
    attachAccountToUserEntity: attachAccountToUserEntity
}
