/**
 * Created by alan on 4/19/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * This schema basically stores the content the user is posting.
 * It contains a content which expect to be the json the client may want to store.
 * It will further be enriched with bubbled and joined count.
 */
var contentSchema = mongoose.Schema({
    content: Schema.Types.Mixed,
    latitude: Number,
    longitude: Number,
    created_date : {type: Number, default: (new Date()).getTime()},
    user: {
        uid: String,
        display_name: String,
        display_pic: String
    }
});

var geoContentSchema = mongoose.Schema({
    object_id: String,
    loc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
    },
    created_date : { type: Date, expires: '15m', default: Date.now },
    user: {
        uid: String,
        display_name: String,
        display_pic: String
    }
});

//geoContentSchema.index({ loc: '2d' });

/* Model definition */
var contentModel = mongoose.model('Content', contentSchema);
var geoContentModel = mongoose.model('GeoContent', geoContentSchema);

function geoSearch(criteria, limit, cb){
    geoContentModel.find(criteria).limit(limit).exec(function(err, locations) {
        if (err) {
            cb(err);
            return;
        }
        cb(null,locations);
    });

    //Location.find({
    //    loc: {
    //        $near: coords,
    //        $maxDistance: maxDistance
    //    }
    //}).limit(limit).exec(function(err, locations) {
    //    if (err) {
    //        return res.json(500, err);
    //    }
    //
    //    res.json(200, locations);
    //});
}

/* Object export */
module.exports = {
    ContentModel: contentModel,
    GeoContentModel: geoContentModel,
    geoSearch: geoSearch
}