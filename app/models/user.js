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
    //cid: {type: String }, // Probably it has a credential id linked.
    loc: {
        type: {type: String, default: 'point'},
        coordinates: [Number]
    },
});

userSchema.index({ phone_number: 1 }, { unique: true });
userSchema.index({ phone_number: 1 ,"accounts.social_id": 1, "accounts.type": 1 }, { unique: true });
userSchema.index({ "role": 1 });

/* Model definition */
var userModel = mongoose.model('User', userSchema);

function updateLocation(user, lat, long, cb) {
    user.loc = {type:"point", coordinates:[lat, long]};
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
