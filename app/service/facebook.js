var FB = require('fb');
var config = require('../config/config');
var async = require('async');

var setAccessToken = function(fbid, cb){
    var fbAccountHandler = require('../models/social_account/facebook_account');
    fbAccountHandler.findSocialAccount(fbid, function(err, account){
        FB.setAccessToken(account.lt_token);
        return cb(err, account);
    });
}

var generateLongTermAccessToken = function(st_token, cb){
    FB.api('oauth/access_token', {
        grant_type: 'fb_exchange_token',
        client_id: config.facebook.client_id,
        client_secret: config.facebook.client_secret,
        fb_exchange_token: st_token
    }, function (res) {
        if(!res || res.error) {
            return cb(res.error);
        }
        return cb(null, res.access_token);
    });
}

var getFeedLastPosts = function(fbid, cb){
    // get changed fields objects
    async.waterfall([
        function(callback){
            setAccessToken(fbid, function(err){
                return callback(err);
            });
        },
        function(callback){
            FB.napi(fbid, {fields: ['feed']}, function(err, response) {
                if(!err){
                    if(response['feed']){
                        var feed = response['feed'].data;
                        feed.forEach(function (post) {
                            callback(null, post);
                        });
                    }else{
                        return callback('no feed found for this user');
                    }
                }else{
                    return callback(err);
                }
            });
        },
        function(post, callback){
            FB.napi(post.id, {fields: config.facebook.post_fields}, function(err, response) {
                callback(err, response);
            });
        }], function(err, content){
            cb(err, content);
    });
}

module.exports = {
    generateLongTermAccessToken: generateLongTermAccessToken,
    getFeedLastPosts: getFeedLastPosts
}