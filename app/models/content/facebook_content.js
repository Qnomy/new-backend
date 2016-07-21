var config = require('../../config/config');
var async = require('async');
var FB = require('fb');

FB.api('oauth/access_token', {
    client_id: config.facebook.client_id,
    client_secret: config.facebook.client_secret,
    grant_type: 'client_credentials'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }
    FB.setAccessToken(res.access_token);
});

var transform = function(source, geoContent, cb){
    var fields = source.changed_fields;
    var field = null;
    if(fields.length > 0){
    	field = fields[0]; //for now we only read the first changed field
    }
	switch(field){
		case this.ObjectTypes.Feed:
			getFeedLastPost(source.uid, function(err, post){
				geoContent.content = post;
				geoContent.source_id = post.id;
				return cb(err, geoContent);
			});
			break;
		default:
			return cb('There is no transform implementation for facebook field: ' + field);

	}
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
		        }
		        callback(err);
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