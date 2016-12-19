var config = require('../../config/config');
var fbAccountHandler = require('../social_account/facebook_account');
var fbService = require('../../service/facebook');
var async = require('async');

var ObjectTypes = {
		Feed: 'feed'
	};

var transform = function(source, geoContent, cb){
	async.waterfall([
		function(callback){
			fbAccountHandler.findSocialAccount(source.uid, function(err, account){
				if(!err && !account){
					err = "could not find account for " + source.uid;
				}
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
			var fields = source.changed_fields;
		    var field = null;
		    if(fields.length > 0){
		    	field = fields[0]; //for now we only read the first changed field
		    }
			switch(field){
				case ObjectTypes.Feed:
					fbService.getFeedLastPosts(source.uid, function(err, post){
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

module.exports = {
	ObjectTypes: ObjectTypes,
	transform: transform
}