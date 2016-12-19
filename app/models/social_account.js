var mongoose = require('mongoose');
var config = require('../config/config');
var async = require('async');
var facebookAccountHandler = require('./social_account/facebook_account');

function save(user, type, social_id, token, cb){
    switch(parseInt(type)){
        case this.AccountTypes.Facebook:
            return facebookAccountHandler.save(user, social_id, token, cb)
            break;
    }
}

function getUserAccounts(user, cb){
    async.series([
        function(callback){ //BubbleYou
            callback(null, {bubbleyou:null})
        }, function(callback){ //Facebook
            facebookAccountHandler.findUserAccount(user, function(err, account){
                return callback(err, {facebook:account});
            });
        }, function(callback, accounts){ //Twitter
            callback(null, {twitter:null})
        }, function(callback, accounts){ //Instagram
            callback(null, {instagram:null})
        }], function(err, accounts){
            cb(err, accounts);
        });
}

function getSocialAccount(type, social_id, cb){
    switch(type){
        case this.AccountTypes.Facebook:
            facebookAccountHandler.findSocialAccount(social_id, function(err, account){
                cb(err, account);
            });
            break;
        default:
            cb('Account not found');
            break;
    }
}

/* Object export */
module.exports = {
    AccountTypes: {
        BubbleYou: 1,
        Facebook: 2,
        Twitter: 3,
        Instagram: 4
    },
    save: save,
    getUserAccounts: getUserAccounts,
    getSocialAccount: getSocialAccount
}