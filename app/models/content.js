/**
 * Created by alan on 4/19/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');
var socialAccountHandler = require('./social_account');
var facebookContentHandler = require('./content/facebook_content');
var defaultContentHandler = require('./content/default_content');

var geoContentSchema = mongoose.Schema({
    source: Number,
    source_id: String,
    content: Schema.Types.Mixed,
    loc: {
        type: {type: String, default: 'point'}, 
        coordinates: {type: [Number], default: [0, 0]}
    },
    created_date : {type: Number, default: (new Date()).getTime()},
    uid: String
});


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
        uid: geoContent.uid
    }}, {upsert: true}, function(err, result){
        return cb(err, result);
    });
}

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
    GeoContentModel: geoContentModel,
    geoSearch: geoSearch,
    transform: transform,
    updateGeoContent: updateGeoContent
}