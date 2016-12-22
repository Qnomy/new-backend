var config = require('../config/config');
var ig = require('inodesta').inodesta({
	client_id: config.instagram.client_id,
	client_secret: config.instagram.client_secret,
	redirect_uri: config.instagram.redirect_uri
});

var handleAuth = function(user, code, cb){
	ig.getAccessToken(code, function(err, result) {
		if(result && !err){
			return cb(err, result.access_token);
		}else{
			return cb(err)
		}
	});
}


module.exports = {
	handleAuth: handleAuth
}