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
    deviceInfo: {},
    created_date: { type: Date, default: Date.now },
    last_login: { type: Date },
    active: {type: Boolean, default: true },
    role: {type: Number, default: 1 },
    accounts: [accountSchema]
});

userSchema.index({ phone_number: 1 }, { unique: true });
userSchema.index({ "accounts.social_id": 1, "accounts.type": 1 }, { unique: true });


/* Model definition */
var accountModel = mongoose.model('Account', accountSchema);
var userModel = mongoose.model('User', userSchema);

/**
 * Method in charge of finding a user based on the criteria passed by parameter.
 * @param criteria The criteria object passed by parameter.
 * @param cb The callback method that will be executed after the search finishes.
 */
function findUserBy(req, res, criteria, cb){
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
    saveUserEntity: saveUserEntity

}