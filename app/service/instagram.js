var ig = require('instagram-node').instagram();
var config = require('../config/config');

ig.use({
	client_id: config.instagram.client_id,
	client_secret: config.instagram.client_secret
});

var handleAuth = function(user, code, cb){
	var redirect_uri = buildRedirectUri(user);
	ig.authorize_user(code, redirect_uri, function(err, result) {
		if(result && !err){
			return cb(err, result.access_token);
		}else{
			return cb(err)
		}
	});
}

var buildRedirectUri = function(user){
	return config.instagram.redirect_uri_base + '/auth/' + user._id;
}

module.exports = {
	handleAuth: handleAuth
}