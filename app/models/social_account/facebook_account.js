var mongoose = require('mongoose');
var fbService = require('../../service/facebook');
var async = require('async');

var fbAccountSchema = mongoose.Schema({
    uid: String,
    fbid: String,
    st_token: String,
    lt_token: {type: String, default: null },
});

fbAccountSchema.index({ uid: 1 }, { unique: true });
fbAccountSchema.index({ uid: 1, fbid: 1, token: 1 }, { unique: true });

var fbAccountModel = mongoose.model('fbAccount', fbAccountSchema);

function save(uid, social_id, st_token, cb){
    async.waterfall([function(callback){
        fbService.generateLongTermAccessToken(st_token, function(err, lt_token){
            callback(err, lt_token);
        })
    }, function(lt_token, callback){
        fbAccountModel.update({uid: uid}, {$set: {fbid: social_id, st_token:st_token, lt_token:lt_token}}, {upsert:true}, function(err, result){
            callback(err, result);
        });
    }], function(err, result){
        cb(err, result);
    });
}

function updateLongtermAccessToken(account, token, cb){
    fbAccountModel.update({uid: account.uid}, {$set: {lt_token:token}}, function(err, result){
        cb(err, result);
    });
}

function findSocialAccount(social_id, cb){
	fbAccountModel.findOne({fbid:social_id}, function(err, account){
       cb(err, account);
    });
}

function findUserAccount(uid, cb){
	fbAccountModel.findOne({uid: uid}, function(err, account){
        cb(err, account);
    });
}

module.exports = {
	save: save,
	findSocialAccount: findSocialAccount,
	findUserAccount: findUserAccount,
    updateLongtermAccessToken: updateLongtermAccessToken
}