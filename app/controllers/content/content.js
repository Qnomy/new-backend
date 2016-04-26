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
    ],function (err,  user, content,geoContent) {
        if (err) {
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).json({
                cid:content.id
            });
        }
    });
};


output.search = function(req, res){
    async.waterfall([
        function (callback){
            ContentHandler.GeoContentModel.find({
                loc: {
                    $near: {
                        $geometry: { type: "Point",  coordinates: [ req.params.longitude, req.params.latitude ] },
                        $minDistance: Number(req.params.min_distance),
                        $maxDistance: Number(req.params.max_distance)
                    }
                }
            }).limit(100).exec(function(err, items){
                callback(err, items);
            });
        },
        function( geoItems, callback) {
            var contentIds = [];
            geoItems.forEach(function (geoItem) {
                contentIds.push(geoItem.object_id);
            });
            ContentHandler.ContentModel.find({'_id': {$in: contentIds}}, function (err, contentItems) {
                callback(err, geoItems, contentItems);
            })
        }
    ],function (err, geoItems, contentItems) {
        if (err) {
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).json({
                result: contentItems
            });
        }
    });

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
            res.status(200).json(content);
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
            res.status(200).json(users);
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
    var to_sign = "publicid=" + publicId + "&timestamp="+timestamp.toString();
    shasum = crypto.createHash('sha1')
    shasum.update(utf8.encode(to_sign + Config.cloudinary.secret))
    var signature = shasum.digest('hex')
    res.status(200).json({
        signature: signature,
        public_id: publicId,
        timestamp: timestamp,
        api_key: Config.cloudinary.apiKey
    });
    res.end();
}


