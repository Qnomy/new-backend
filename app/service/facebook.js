var FB = require('fb');
var fbAccountHandler = require('../social_account/facebook_account');

var generateLongTermAccessToken = function(account, cb){
    async.waterfall([
        function(callback){
            FB.api('oauth/access_token', {
                grant_type: 'fb_exchange_token',
                client_id: config.facebook.client_id,
                client_secret: config.facebook.client_secret,
                fb_exchange_token: account.st_token
            }, function (res) {
                if(!res || res.error) {
                    return callback(res.error);
                }
                return callback(null, res.access_token);
            });
        },
        function(token,  callback){
            fbAccountHandler.updateLongtermAccessToken(account, token, function(err, result){
                account.lt_token = token;
                return callback(err, token);
            })
        }], function(err, token){
            cb(err, token);
        });
}

var getFeedLastPosts = function(fbid, cb){
    // get changed fields objects
    async.waterfall([
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