var mongoose = require('mongoose');
var config = require('../../config/config');

var fbAccountSchema = mongoose.Schema({
    uid: String,
    fbid: String,
    token: String
});

fbAccountSchema.index({ uid: 1 }, { unique: true });
fbAccountSchema.index({ uid: 1, fbid: 1, token: 1 }, { unique: true });

var fbAccountModel = mongoose.model('fbAccount', fbAccountSchema);

function save(uid, social_id, token, cb){
    fbAccountModel.update({uid: uid}, {$set: {fbid: social_id, token:token}}, {upsert:true}, function(err, result){
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
	findUserAccount: findUserAccount
}