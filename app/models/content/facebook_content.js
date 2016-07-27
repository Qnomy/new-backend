var config = require('../../config/config');
var socialAccountHandler = require('../social_account');
var async = require('async');
var FB = require('fb');

/*FB.api('oauth/access_token', {
    client_id: config.facebook.client_id,
    client_secret: config.facebook.client_secret,
    grant_type: 'client_credentials'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }
    console.log(res.access_token);
    FB.setAccessToken(res.access_token);
});
*/

var transform = function(source, geoContent, cb){
	var objectTypes = this.ObjectTypes;
	socialAccountHandler.getSocialAccount(socialAccountHandler.AccountTypes.Facebook, source.uid, function(err, account){
		if(!err){
			FB.setAccessToken(account.token);
			var fields = source.changed_fields;
		    var field = null;
		    if(fields.length > 0){
		    	field = fields[0]; //for now we only read the first changed field
		    }
			switch(field){
				case objectTypes.Feed:
					getFeedLastPost(source.uid, function(err, post){
						if(!err){
							geoContent.content = post;
							geoContent.source_id = post.id;
							return cb(err, geoContent);
						}else{
							return cb(err);
						}
					});
					break;
				default:
					return cb('There is no transform implementation for facebook field: ' + field);
			}
		}else{
			cb(err);
		}
	})
};

var getFeedLastPost = function(fbid, cb){
	// get changed fields objects
    async.waterfall([
    	function(callback){
    		FB.napi(fbid, {fields: ['feed']}, function(err, response) {
		        if(!err){
		        	var feed = response['feed'].data;
		        	if(feed.length > 0){
		        		return callback(err, feed[0]);
		        	}
		        }else{
		        	return callback(err);
		        }
		    });
    	},
    	function(post, callback){
    		FB.napi(post.id, {fields: config.facebook.post_fields}, function(err, response) {
		        return callback(err, response);
		    });
    	}], function(err, content){
    		return cb(err, content);
    });
}

module.exports = {
	ObjectTypes: {
		Feed: 'feed'
	},
	transform: transform
}