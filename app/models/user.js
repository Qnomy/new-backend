/**
 * Created by alan on 12/17/15.
 */

var mongoose = require('mongoose');
var config = require('../config/config');

var userSchema = mongoose.Schema({
    phone_number: String,
    display_name: String,
    display_pic: String,
    created_date: { type: Date, default: Date.now },
    last_login: { type: Date },
    active: {type: Boolean, default: true },
    role: {type: Number, default: 1 },
    //cid: {type: String }, // Probably it has a credential id linked.
    loc: [Number],         // [<longitude>, <latitude>]
});

userSchema.index({ phone_number: 1 }, { unique: true });
userSchema.index({ phone_number: 1 ,"accounts.social_id": 1, "accounts.type": 1 }, { unique: true });
userSchema.index({ "role": 1 });

/* Model definition */
var userModel = mongoose.model('User', userSchema);

/* Object export */
module.exports = {
    UserModel: userModel,
    RoleTypes : {
        Public: 1,
        Admin: 2
    }
}