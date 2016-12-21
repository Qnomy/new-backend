var mongoose = require('mongoose');
var fbService = require('../../service/facebook');
var async = require('async');
var ObjectId = require('mongodb').ObjectID;

var fbAccountSchema = mongoose.Schema({
    _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    fbid: String,
    st_token: String,
    lt_token: {type: String, default: null },
});

fbAccountSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
        delete ret._id;
        delete ret.__v;
        ret.user = doc._user;
        delete ret._user;
        return ret;
    }
});

fbAccountSchema.index({ _user: 1 }, { unique: true });
fbAccountSchema.index({ fbid: 1 }, { unique: true });

var fbAccountModel = mongoose.model('fbAccount', fbAccountSchema);

function save(user, social_id, st_token, cb){
    async.waterfall([function(callback){
        fbService.generateLongTermAccessToken(st_token, function(err, lt_token){
            callback(err, lt_token);
        })
    }, function(lt_token, callback){
        fbAccountModel.update({_user: user._id}, {$set: {fbid: social_id, st_token:st_token, lt_token:lt_token}}, {upsert:true}, function(err, result){
            callback(err, result);
        });
    }], function(err, result){
        cb(err, result);
    });
}

function updateLongtermAccessToken(account, token, cb){
    fbAccountModel.update({_user: account._user}, {$set: {lt_token:token}}, function(err, result){
        cb(err, result);
    });
}

function findSocialAccount(social_id, cb){
	fbAccountModel.findOne({fbid:social_id}, function(err, account){
       cb(err, account);
    });
}

function findUserAccount(user, cb){
	fbAccountModel.find({_user: user._id}, function(err, account){
        cb(err, account);
    });
}

module.exports = {
	save: save,
	findSocialAccount: findSocialAccount,
	findUserAccount: findUserAccount,
    updateLongtermAccessToken: updateLongtermAccessToken
}