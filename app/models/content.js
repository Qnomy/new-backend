var mongoose = require('mongoose');
var schema = mongoose.Schema;
var async = require('async');
var socialAccountHandler = require('./social_account');
var config = require('../config/config');

var geoContentSchema = mongoose.Schema({
    source: Number,
    type: Number,
    objectid: String,
    raw: schema.Types.Mixed,
    loc: {
        type: {type: String, default: 'Point'}, 
        coordinates: {type: [Number], default: [0, 0]}    
	},
    altitude: {type: Number, default: 0},
    created_date : {type: Date, default: Date.now},
    _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    _bubble: {type: mongoose.Schema.Types.ObjectId, ref: 'bubble'}
});

geoContentSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
        delete ret._id;
        ret.bubble = doc._bubble;
        delete ret._bubble;
        ret.user = doc._user;
        delete ret._user;
        return ret;
    }
});

geoContentSchema.virtual('is_bubble').get(function(){
    return this._bubble != null;
});

geoContentSchema.virtual('message').get(function(){
    var socialContentHandler = getSocialContentHandler(this.source);
    return socialContentHandler.getContentMessage(this);
});

geoContentSchema.virtual('link').get(function(){
    var socialContentHandler = getSocialContentHandler(this.source);
    return socialContentHandler.getContentLink(this);
});

geoContentSchema.virtual('image').get(function(){
    var socialContentHandler = getSocialContentHandler(this.source);
    return socialContentHandler.getContentImage(this);
});

/*indexes*/
geoContentSchema.index({ _user: 1, source: 1 }, { unique: false});

/* Model definition */
var geoContentModel = mongoose.model('GeoContent', geoContentSchema);

function getSocialContentHandler(source){
    var socialContentHandler = null;
    switch(source){
        case socialAccountHandler.AccountTypes.Facebook:
            socialContentHandler = require('./content/facebook_content');
            break;
        default:
            socialContentHandler = require('./content/default_content');
            break;
    }
    return socialContentHandler;
}

function transform(raw, type, cb){
    var socialContentHandler = getSocialContentHandler(type);
    var geoContent = new geoContentModel();
    geoContent.source = type;
    return socialContentHandler.transform(raw, geoContent, cb);
}

function updateGeoContent(geoContent, cb){
    geoContentModel.update({objectid: geoContent.objectid}, geoContent, {upsert: true}, function(err, result){
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
            geoContent.save(function(err){
                callback(err, bubble);
            })
        }], function(err, bubble){
            cb(err, bubble);
        })
}

function disconnectGeoContentBubble(geoContent, cb){
    geoContent._bubble = undefined;
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
    var query = geoContentModel.find(criteria)
    .populate({path: '_bubble', populate: {path: 'members', populate:{path:'_user', select: 'display_name display_pic'}}})
    .populate({path: '_bubble', populate: {path: '_owner', select: 'display_name display_pic'}})
    .populate({path: '_bubble', populate: {path: '_geoContent'}})
    .populate('_user', 'display_name display_pic');
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