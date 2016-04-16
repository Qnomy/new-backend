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

/**
 * Method in charge of finding a user based on the criteria passed by parameter.
 * @param criteria The criteria object passed by parameter.
 * @param cb The callback method that will be executed after the search finishes.
 */
function findUserBy(criteria, cb){
    userModel.findOne(criteria,
        function (err, user){
            if (err){
                err = {server:config.service_friendly_name, http_status:500, status:{ message: "There was a problem trying to find the user, please try again later." }, original: err};
            }
            if (cb){
                cb(err, user);
            }
        }
    )
}

function findUsersBy(criteria, cb){
    userModel.find(criteria,
        function (err, users){
            if (err){
                err = {server:config.service_friendly_name, http_status:500, status:{ message: "There was a problem trying to find users, please try again later." }, original: err};
            }
            if (cb){
                cb(err, users);
            }
        }
    )
}


/**
 * Saves the user into the data store.
 * @param user The user we are trying to store.
 * @param cb The callback method that will be executed after the store.
 */
function saveUserEntity(user, cb){
    user.save(function(err){
        if (err){
            err = {server:config.service_friendly_name, http_status:500, status:{ message: "There was a problem saving the user, please try again later."}, original: err}
        }
        if (cb){
            cb(err, user);
        }
    })
}

function saveAccount(user, account_type, account_social_id, account_token, account_meta, cb){
    // try to find the document..
    var account = null;
    for (var i = 0; i < user.accounts; i++){
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
    account.social_id = account_social_id;
    account.token = account_token;
    account.meta = account_meta;
    user.accounts.push(account);

    saveUserEntity(user, cb);
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
    findUserBy: findUserBy,
    saveUserEntity: saveUserEntity,
    findUsersBy:findUsersBy,
    saveAccount: saveAccount

}