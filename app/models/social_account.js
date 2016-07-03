var mongoose = require('mongoose');
var config = require('../config/config');
var async = require('async');

var fbAccountSchema = mongoose.Schema({
    uid: String,
    fbid: String,
    token: String
});

fbAccountSchema.index({ uid: 1 }, { unique: true });
fbAccountSchema.index({ uid: 1, fbid: 1, token: 1 }, { unique: true });

var fbAccountModel = mongoose.model('fbAccount', fbAccountSchema);

function save(uid, type, social_id, token, cb){
    switch(type){
        case this.AccountTypes.Facebook:
            return saveFacebookAccount(uid, social_id, token, cb)
            break;
    }
}

function get(uid, cb){
    async.series([
        function(callback){ //BubbleYou
            callback(null, {bubbleyou:null})
        }, function(callback){ //Facebook
            fbAccountModel.findOne({uid: uid}, function(err, account){
                return callback(err, {facebook:account});
            });
        }, function(callback, accounts){ //Twitter
            callback(null, {twitter:null})
        }, function(callback, accounts){ //Instagram
            callback(null, {instagram:null})
        }], function(err, accounts){
            cb(err, accounts);
        });
}

function saveFacebookAccount(uid, social_id, token, cb){
    async.waterfall([
        function(callback){
            fbAccountModel.findOne({uid:uid}, function(err, account){
               return callback(err, account);
            });
        },
        function(account, callback){
            if(!account){
                account = new fbAccountModel();
            }
            account.uid = uid;
            account.social_id = social_id;
            account.token = token;
            account.save(function(err, account){
               return callback(err, account);
            })
    }], function(err, result){
        cb(err, result);
    });
}

/* Object export */
module.exports = {
    fbAccountModel: fbAccountModel,
    AccountTypes: {
        BubbleYou: 1,
        Facebook: 2,
        Twitter: 3,
        Instagram: 4
    },
    save: save,
    get: get
}