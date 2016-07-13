var ErrorHandler = require('./error_handler');
var ResponseBuilder = require("./response_builder")
var async = require('async');
var Config = require('../config/config');
var FB = require('fb');

var ContentHandler = require('../models/content');
var socialAccountHandler = require('../models/social_account');

FB.api('oauth/access_token', {
    client_id: Config.facebook.client_id,
    client_secret: Config.facebook.client_secret,
    grant_type: 'client_credentials'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }
    FB.setAccessToken(res.access_token);
});

var transform = function(entry, cb){
    console.log('and here', '/', entry.uid);
    async.waterfall(
        function(callback){
            
        }, // get user current location
        function(callback, content){ // get changed fields objects
            FB.napi(entry.uid, {fields: entry.changed_fields}, function(error, response) {
                if(error) {
                    callback(error);
                } else {
                    var changed_fields_obj = [];
                    entry.changed_fields.forEach(function(field){
                        if(response[field] && response[field].data){
                            changed_fields_obj.push(response[field].data[0]);
                        }
                    })

                    cb(null, changed_fields_obj);
                }
            })
        },
        function(callback, content){

        }
    )
};

var output = module.exports;

output.get = function(req, res){
    var verified = config.facebook.webhooks.verify_token == req.query["hub.verify_token"];
    if(verified){
        res.status(200).write(req.query["hub.challenge"]);
        res.end();
    }else{
        err = "Bad facebook webhook verification token";
        ErrorHandler.handle(res, err);
    }
};

output.post = function(req, res){
    console.log('here');
    var fs = require('fs');
    fs.appendFile('fblog.txt', Date().toString() + "\n" + JSON.stringify(req.body) + "\n\n", function (err) {});
    
    req.body.entry.forEach(function(entry) {
        transform(entry, function(err, content){
            console.log('fb content:', content);
        });    
    });
    res.status(200).write("ok");
};

output.processPending = function (req, res) {
    async.waterfall([
        function (callback){
            // ContentHandler.PendingContentModel.find({}, function(err, records) {
            //     records.forEach(function (rec) {
            //     })
            // });
            FB.api('/me?access_token=EAAVZCL30UfR0BABit45Cw45rAzZCICkbgfuW0TZAcPFtUk18hZBOjpLPMmryYOT56G0oOIaPdw0flMNxCVyXBE4WwZAXa1o3XzuYcU2q95FU9GeLYUHLK5InLo7Ah5BUWPH7ZAOsZBqCE3advsMAmf21WvonGKZBq9ESw62c9ZC8CPJE6Ae8plw1WHg6w9jUSaPIZD', {fields: ['id', 'name', 'location']}, function (res) {
                if(!res || res.error) {
                    console.log(!res ? 'error occurred' : res.error);
                    return;
                }
                console.log(res.id);
                console.log(res.name);
            });
            callback(null);
        }
    ],function (err){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            res.end();
            return;
        };
    });
}