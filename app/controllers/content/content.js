var mongoose = require('mongoose');
var crypto =  require('crypto');
var ObjectId = require('mongodb').ObjectID;
var Config = require('../../config/config');
var ContentBuilder = require('./content_builder');
var ContentHandler = require('../../models/content');
var ErrorHandler = require('../error_handler');
var UserHandler = require('../../models/user');
var Repository = require('../../models/repository');
//var utf8 = require('utf8');
var async = require('async');
var ResponseBuilder = require("../response_builder")

var utf8 = require('utf8')

var output = module.exports;


/**********************************************************************************************************************/
/*                                                    Post Api                                                        */
/**********************************************************************************************************************/

output.post = function(req, res){
    async.waterfall([
        function (callback){
            UserHandler.UserModel.findOne({_id: new ObjectId(req.params.uid)}, function(err, user){
                if (!user){
                    callback({code: 2, message: "There was no user found."});
                } else {
                    callback(err, user)
                }
            });
        },
        function (user, callback){
            // Store it forever in the content collection.
            ContentBuilder.buildContent(user, req, res, function(err, content){
                content.save(function(err){
                    callback(err, user, content)
                });
            });
        },
        function (user, content,callback){
            // Keep it in the geo located index.
            ContentBuilder.buildGeoContent(user,content, req, res, function(err, geoContent){
                geoContent.save(function(err){
                    callback(err, user, content,geoContent)
                });
            });
        },
        function (user, content, geoContent,callback){
            // TODO: Fill in the timeline of the user !!!!
            callback(null, user, content, geoContent);
        }
    ],function (err, user, content, geoContent) {
        if (err) {
            ErrorHandler.handle(res, err);
        } else {
            ResponseBuilder.sendResponse(res, 200, {cid:content.id});
        }
    });
};

output.search = function(req, res){
    async.waterfall([
        function(callback){
            if(req.params.last){
                ContentHandler.getGeoContent(req.params.last, function(err, geoContent){
                    callback(err, geoContent);
                });
            }else{
                callback(null, null);
            }
        },
        function(last, callback){
            ContentHandler.geoSearch(
                req.params.longitude, 
                req.params.latitude, 
                req.params.max_distance,
                req.params.limit,
                last,
                function(err, results){
                   callback(err, results); 
                });
        }], function(err, results){
            if (err) {
                ErrorHandler.handle(res, err);
            } else {
                ResponseBuilder.sendResponse(res, 200, {'results': results});
            }  
        })
}

output.get = function(req, res){
    async.waterfall([
        function (callback){
            ContentHandler.ContentModel.findOne({_id: new ObjectId(req.params.cid)}, function(err, content){
                if (err){
                    callback(err);
                } else{
                    callback(err, content);
                }
            });
        }
    ], function (err, content){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            ResponseBuilder.sendResponse(res, 200, content);
        }
    });
};


output.find = function(req, res){
    async.waterfall([
        function(callback) {
            var criteria = {}
            for (var param in req.query){
                var paramValue = req.query[param];
                criteria[param] = paramValue;
            }
            ContentHandler.findBy(criteria, function(err, users){
                if (err){
                    callback(err);
                    return;
                }
                callback(err, users);
            });
        }
    ], function (err, users){
        if (err){
            ErrorHandler.handle(res, err);
        } else {
            ResponseBuilder.sendResponse(res, 200, users);
        }
    });
};


/**
 *
 * @param req
 * @param res
 */
output.signature = function(req, res) {
    var publicId = mongoose.Types.ObjectId().toString();
    var timestamp=Math.floor(new Date() / 1000);
    var to_sign = "public_id=" + publicId + "&timestamp="+timestamp.toString() + Config.cloudinary.secret;
    shasum = crypto.createHash('sha1')
    shasum.update(utf8.encode(to_sign))
    var signature = shasum.digest('hex')
    ResponseBuilder.sendResponse(res, 200, {signature: signature, public_id: publicId, timestamp: timestamp, api_key: Config.cloudinary.apiKey});
}


