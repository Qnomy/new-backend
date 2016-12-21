var mongoose = require('mongoose');
var igService = require('../services/instagram');
var async = require('async');
var ObjectId = require('mongodb').ObjectID;

var igAccountSchema = mongoose.Schema({
    _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    igid: String,
    code: String,
    token: {type: String, default: null },
});

igAccountSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
        delete ret._id;
        delete ret.__v;
        ret.user = doc._user;
        delete ret._user;
        return ret;
    }
});

igAccountSchema.index({ _user: 1 }, { unique: true });
igAccountSchema.index({ igid: 1 }, { unique: true });

var igAccountModel = mongoose.model('ig_account', igAccountSchema);

function registerAccessToken(user, code, cb){
    async.waterfall([function(callback){
        igService.handleAuth(user, code, function(err, auth){
            callback(err, auth);
        });
    }, function(auth, callback){
        igAccountModel.update({
            _user: user._id
        }, {
            $set: {
                igid: auth.user.id, 
                code:code, 
                token:auth.access_token
            }}, {upsert:true}, function(err, result){
            callback(err, result);
        });
    }], function(err, result){
        cb(err, result);
    });
}

function findSocialAccount(igid, cb){
	igAccountModel.findOne({igid:igid}, function(err, account){
       cb(err, account);
    });
}

function findUserAccount(user, cb){
	igAccountModel.find({_user: user._id}, function(err, account){
        cb(err, account);
    });
}

module.exports = {
	registerAccessToken: registerAccessToken,
	findSocialAccount: findSocialAccount,
	findUserAccount: findUserAccount
}