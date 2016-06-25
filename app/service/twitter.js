/**
 * Created by alan on 12/31/15.
 */

var config = require('../config/config');
var RestClient = require('node-rest-client').Client;
var httpClient = new RestClient();

module.exports = {
    validate: function (token, cb){
        var queryUrl = config.rest_api.social_validation_url.twitter;
        var args = config.rest_api.default_config;
        args.parameters = { access_token: token};
        httpClient.get(queryUrl, args, function(data, response){
            var err = null;
            if (response.statusCode != 200){
                err = {status: response.statusCode, message: response.statusMessage};
            }
            if (cb != null){
                cb(err);
            }
        }).on('requestTimeout',function(req){
            if (cb != null){
                cb({status: 500, message: "Request timeout"});
            }
            req.abort();
        }).on('responseTimeout',function(res){
            if (cb != null){
                cb({status: 500, message: "Response timeout"});
            }
        }).on('error', function(err){
            if (cb != null){
                cb({status: 400, message: "General error", error: err});
            }
        });
    }
}