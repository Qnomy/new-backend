var mongoose = require('mongoose');
var schema = mongoose.Schema;
var async = require('async');
var socialAccountHandler = require('./social_account');
var facebookContentHandler = require('./content/facebook_content');
var defaultContentHandler = require('./content/default_content');
var config = require('../config/config');

var geoContentSchema = mongoose.Schema({
    source: Number,
    source_id: String,
    content: schema.Types.Mixed,
    loc: {
        type: {type: String, default: 'Point'}, 
        coordinates: {type: [Number], default: [0, 0]}    
	},
    altitude: {type: Number, default: 0},
    created_date : {type: Date, default: Date.now},
    uid: String,
    _bubble: {type: mongoose.Schema.Types.ObjectId, ref: 'bubble'},
    is_bubble: {type: Boolean, default: false}
});

/*indexes*/
geoContentSchema.index({ uid: 1, source: 1 }, { unique: false});

/* Model definition */
var geoContentModel = mongoose.model('GeoContent', geoContentSchema);

function transform(content, type, cb){
    var socialContentHandler = null;
    switch(type){
        case socialAccountHandler.AccountTypes.Facebook:
            socialContentHandler = facebookContentHandler;
            break;
        default:
            socialContentHandler = defaultContentHandler;
            break;
    }
    var geoContent = new geoContentModel();
    geoContent.source = type;
    return socialContentHandler.transform(content, geoContent, cb);
}

function updateGeoContent(geoContent, cb){
    geoContentModel.update({source_id: geoContent.source_id}, {$set:{
        source: geoContent.source,
        source_id: geoContent.source_id,
        content: geoContent.content,
        loc: geoContent.loc,
        altitude: geoContent.altitude,
        uid: geoContent.uid
    }}, {upsert: true}, function(err, result){
        return cb(err, result);
    });
}

function joinGeoContentBubble(geoContent, user, cb){
    var bubbleHandler = require('./bubble');
    async.waterfall([
        function(callback){
            bubbleHandler.getBubbleByGeoContentId(geoContent._id, function(err, bubble){
                return callback(err, bubble);
            });
        }, function(bubble, callback){
            bubbleHandler.joinBubble(bubble, user, function(err, bubble){
                return callback(err, bubble);
            })
        }, function(bubble, callback){
            geoContent._bubble = bubble._id;
            geoContent.is_bubble = true;
            geoContent.save(function(err){
                callback(err, bubble);
            })
        }], function(err, bubble){
            cb(err, bubble);
        })
}

function disconnectGeoContentBubble(geoContent, cb){
    geoContent._bubble = null;
    geoContent.is_bubble = false;
    return geoContent.save(cb);
}

function geoSearch(lng, lat, distance, limit, last, cb){
    var criteria = {
        loc: {
            $near: {
                $geometry: { type: "Point",  coordinates: [lng, lat] },
                $maxDistance: Number(distance || config.rest_api.max_distance)
            }
        }
    };
    var query = geoContentModel.find(criteria).populate('_bubble');
    query.limit(limit || config.rest_api.page_limit);
    query.sort('-created_date');
    if(last){
        query.where({created_date: {$lte: last.created_date}});
    }
    query.exec(function(err, results) {
        return cb(err, results);
    });
}

function getGeoContent(geoContentId, cb){
    geoContentModel.findOne({_id: geoContentId}, function(err, geoContent){
        cb(err, geoContent);
    })
}


/* Object export */
module.exports = {
    GeoContentModel: geoContentModel,
    geoSearch: geoSearch,
    transform: transform,
    getGeoContent: getGeoContent,
    updateGeoContent: updateGeoContent,
    joinGeoContentBubble: joinGeoContentBubble,
    disconnectGeoContentBubble: disconnectGeoContentBubble
}