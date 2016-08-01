var config = require('../../config/config');
var fbAccountHandler = require('../social_account/facebook_account')
var async = require('async');
var FB = require('fb');

var ObjectTypes = {
		Feed: 'feed'
	};

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

var transform = function(source, geoContent, cb){
	async.waterfall([
		function(callback){
			fbAccountHandler.findSocialAccount(source.uid, function(err, account){
				return callback(err, account)
			});
		},
		function(account, callback){
			if(!account.lt_token){
				generateLongTermAccessToken(account, function(err, token){
					return callback(err, account);
				})
			}else{
				return callback(null, account);
			}
		},
		function(account, callback){
			FB.setAccessToken(account.lt_token);
			var fields = source.changed_fields;
		    var field = null;
		    if(fields.length > 0){
		    	field = fields[0]; //for now we only read the first changed field
		    }
			switch(field){
				case ObjectTypes.Feed:
					getFeedLastPosts(source.uid, function(err, post){
						if(!err){
							geoContent.content = post;
							geoContent.source_id = post.id;
							callback(err, geoContent);
						}else{
							return callback(err);
						}
					});
					break;
				default:
					return callback('There is no transform implementation for facebook field: ' + field);
			}
		}],function(err, geoContent){
			cb(err, geoContent);
	});
};

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
			        	// if(feed.length > 0){
			        	// 	return callback(err, feed[0]);
			        	// }
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
	ObjectTypes: ObjectTypes,
	transform: transform
}