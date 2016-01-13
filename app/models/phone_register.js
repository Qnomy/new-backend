/**
 * Created by alan on 1/7/16.
 */
var mongoose = require('mongoose');
var config = require('../config/config');

var phoneRegSchema = mongoose.Schema({
    phone_number: String,
    code: String,
    role: { type: Number, default: 1 },
    uid: String,
    createdAt: { type: Date, expires: 3600, default: Date.now }
});

phoneRegSchema.index({ code: 1, phone_number: 1 }, {unique: true});
var phoneRegModel = mongoose.model('PhoneReg', phoneRegSchema);


/**
 * Method in charge of finding a user based on the criteria passed by parameter.
 * @param criteria The criteria object passed by parameter.
 * @param cb The callback method that will be executed after the search finishes.
 */
function findPhoneRegBy(criteria, cb){
    phoneRegModel.findOneAndRemove(criteria,
        function (err, phoneReg){
            if (err){
                err = {server:config.service_friendly_name, http_status:500, status:{ message: "There was a problem trying to find the phoneReg, please try again later." }, original: err};
            }
            if (cb){
                cb(err, phoneReg);
            }
        }
    )
}

/**
 * Saves the user into the data store.
 * @param user The user we are trying to store.
 * @param cb The callback method that will be executed after the store.
 */
function savePhoneRegEntity(req, res, phoneReg, cb){
    phoneReg.save(function(err){
        if (err){
            err = {server: config.service_friendly_name, http_status: 500, status: {message: "There was a problem registering your phone, please try again later."}, original: err};
        }
        cb(err, phoneReg);
    })
}

module.exports = {
    PhoneRegModel: phoneRegModel,
    findPhoneRegBy: findPhoneRegBy,
    savePhoneRegEntity: savePhoneRegEntity
}