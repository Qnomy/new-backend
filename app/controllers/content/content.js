var mongoose = require('mongoose');
var crypto =  require('crypto');
var ContentBuilder = require('./content_builder');
var ContentHandler = require('../../models/content');
var ErrorHandler = require('../error_handler');
var UserHandler = require('../../models/user');
var Repository = require('../../models/repository');
//var utf8 = require('utf8');
var async = require('async');

var output = module.exports;


/**********************************************************************************************************************/
/*                                                    Post Api                                                        */
/**********************************************************************************************************************/

output.post = function(req, res){
    async.waterfall([
        function (callback){
            UserHandler.UserModel.findOne({id: req.body.uid}, function(err, user){
                callback(err, user)
            });
        },
        function (user, callback){
            ContentBuilder.buildContent(user, req, res, function(err, content){
                content.save(function(err, pContent){
                    callback(err, user, pContent)
                });
            });
        },
        function (user, pContent,callback){
            ContentBuilder.buildGeoContent(user,pContent, req, res, function(err, geoContent){
                geoContent.save(ContentHandler.GeoContentModel , function(err, pGeoContent){
                    callback(err, user, pContent,pGeoContent)
                });
            });
        },
        function (user, pContent, pGeoContent,callback){
            // TODO: Fill in the timeline of the user !!!!
            callback(null, user, pContent, pGeoContent);
        }

    ],function (err,  user, pContent,pGeoContent) {
        if (err) {
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).json({
                cid:pContent.id
            });
        }
    });
};


output.search = function(req, res){

    async.waterfall([
        function (callback){
            var searchCriteria = JSON.parse(req.body.criteria);
            ContentHandler.geoSearch(searchCriteria, req.body.limit, function(err, geoContentItems){
                callback(err, geoContentItems);
            });
        },
        function( geoContentItems, callback) {
            var contentIds = [];
            geoContentItems.forEach(function (geoItem) {
                contentIds.push(geoItem.object_id);
            });
            Repository.findBy(ContentHandler.ContentModel, {'_id': {$in: contentIds}}, 404, "There was a problem while retrieving info from the geoindex", function (err, items) {
                callback(err, geoContentItems, items);
            })
        }
    ],function (err, pContent, pGeoContent) {
        if (err) {
            ErrorHandler.handle(res, err);
        } else {
            res.status(200).json({
                cid:content.id
            });
        }
    });

}


output.get = function(req, res){
    async.waterfall([
        function (user, callback){
            ContentHandler.ContentModel.getBy({id: req.params.cid}, function(err, users){
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
//output.signature = function(req, res) {
//    var publicId = mongoose.Types.ObjectId().toString();
//    var timestamp=Math.floor(new Date() / 1000);
//    var to_sign = "publicid=" + publicId + "&timestamp="+timestamp.toString();
//    shasum = crypto.createHash('sha1')
//    shasum.update(utf8.encode(to_sign + config.cloudinary_secret))
//    var signature = shasum.digest('hex')
//    res.status(200).json({
//        signature: signature,
//        public_id: publicId,
//        timestamp: timestamp,
//        api_key: config.cloudinary_apikey
//    });
//    res.end();
//}


