var mongoose = require('mongoose');
var schema = mongoose.Schema;
var config = require('../config/config');

var userDeviceSchema = mongoose.Schema({
	_user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'}, 
	platform: Number,
	token: String,
	arn: String
});

userDeviceSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
        delete ret._id;
        delete ret.__v;
        delete ret._user;
        return ret;
    }
});

userDeviceSchema.index({ _user: 1}, { unique: false});

userDeviceModel = mongoose.model('user_device', userDeviceSchema);

var platforms = {
	APNS: 1,
	GCM: 2
}

function createUserDevice(user, platform, token, cb){
	var device = new userDeviceModel();
	device.user = user._id;
	device.platform = platform;
	device.token = token;
	device.save(cb);
}

module.exports = {
	Platforms: platforms,
	createUserDevice: createUserDevice 
}