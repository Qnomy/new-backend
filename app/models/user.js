/**
 * Created by alan on 12/17/15.
 */

var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var config = require('../config/config');
var socialAccountHandler = require('./social_account');
var async = require('async');

var userSchema = mongoose.Schema({
    phone_number: String,
    display_name: String,
    display_pic: String,
    created_date: { type: Date, default: Date.now },
    last_login: { type: Date },
    active: {type: Boolean, default: true },
    role: {type: Number, default: 1 },
    loc: {
        type: {type: String, default: 'Point'},
        coordinates: {type: [Number], default: [0,0]}
    },
    altitude: {type: Number, default: 0}
});

userSchema.index({ phone_number: 1 }, { unique: true });
userSchema.index({ "role": 1 });

userSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

/* Model definition */
var userModel = mongoose.model('User', userSchema);

function updateLocation(user, lat, long, altitude, cb) {
    user.loc = {type:"Point", coordinates:[lat, long]};
    user.altitude = altitude;
    user.save(function(err, pUser){
        cb(err, pUser);
    })
}

function markContentLocation(geoContent, type, social_id, cb){
    async.waterfall([
        function(callback){ //get social account
            socialAccountHandler.getSocialAccount(type, social_id, function(err, account){
                if(account){
                    callback(err, account);
                }else{
                    callback('Account not found');
                }
            });
        },
        function(account, callback){ // mark location
            geoContent.uid = account.uid;
            getUser(geoContent.uid, function(err, user){
                callback(err, user);
            });
        }],function(err, user){
            if(!err){
                geoContent.loc = user.loc;
                geoContent.altitude = user.altitude;
            }
            cb(err, geoContent);
        });
}

function getUser(uid, cb){
    userModel.findOne({_id:new ObjectId(uid)}, function(err, user) {
        cb(err, user);
    });
}

/* Object export */
module.exports = {
    UserModel: userModel,
    RoleTypes : {
        Public: 1,
        Admin: 2
	},
    updateLocation: updateLocation,
    markContentLocation: markContentLocation,
    getUser: getUser
}
