/**
 * Created by alan on 12/17/15.
 */

var mongoose = require('mongoose');

var accountSchema = mongoose.Schema({
    type: Number,
    social_id: String,
    token: String,
    created_date: { type: Date, default: Date.now },
    meta: mongoose.Schema.Types.Mixed
});

var userSchema = mongoose.Schema({
    token: String,
    token_refresh: String,
    token_expiration: Number,
    display_name: String,
    display_pic: String,
    deviceInfo: {},
    created_date: { type: Date, default: Date.now },
    last_login: Date,
    active: {type: Boolean, default: true },
    role: {type: Number, default: 1 },
    accounts: [accountSchema],
    latitude: Number,
    longitude: Number
});

userSchema.index({ token: 1 });
userSchema.index({ "accounts.social_id": 1, "accounts.type": 1 }, { unique: true });

/* Model definition */
var accountModel = mongoose.model('Account', accountSchema);
var userModel = mongoose.model('User', userSchema);

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
    }
}