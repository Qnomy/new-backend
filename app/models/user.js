/**
 * Created by alan on 12/17/15.
 */

var mongoose = require('mongoose');
var config = require('../config/config');

var accountSchema = mongoose.Schema({
    type: Number,
    social_id: String,
    token: String,
    created_date: { type: Date, default: Date.now },
    meta: mongoose.Schema.Types.Mixed
});

var userSchema = mongoose.Schema({
    phone_number: String,
    display_name: String,
    display_pic: String,
    created_date: { type: Date, default: Date.now },
    last_login: { type: Date },
    active: {type: Boolean, default: true },
    role: {type: Number, default: 1 },
    //cid: {type: String }, // Probably it has a credential id linked.
    accounts: [accountSchema]
});

userSchema.index({ phone_number: 1 }, { unique: true });
userSchema.index({ "accounts.social_id": 1, "accounts.type": 1 }, { unique: true });
userSchema.index({ "role": 1 });

/* Model definition */
var accountModel = mongoose.model('Account', accountSchema);
var userModel = mongoose.model('User', userSchema);

function save(user, account_type, account_social_id, account_token, account_meta, cb){
    // try to find the document..
    var account = null;
    for (var i = 0; i < user.accounts.length; i++){
        if (user.accounts[i].type == account_type){
            account = user.accounts[i];
            break;
        }
    }
    // if the doc was not found, create a new one.
    if (!account){
        account = new accountModel();
    }
    // update the fields and save the document
    account.type = account_type;
    account.social_id = account_social_id;
    account.token = account_token;
    account.meta = account_meta;

    user.accounts.addToSet(account);
    user.save(function(err, pUser){
        cb(err, pUser);
    })
}

/* Object export */
module.exports = {
    AccountModel: accountModel,
    UserModel: userModel,
    AccountTypes: {
        BubbleYou: 1,
        Facebook: 2,
        Twitter: 3,
        Instagram: 4
    },
    RoleTypes : {
        Public: 1,
        Admin: 2
    },
    save: save
}