/**
 * Created by alan on 1/13/16.
 */
var mongoose = require('mongoose');
var config = require('../config/config');

var credentialsSchema = mongoose.Schema({
    name: String,
    last_name: String,
    email: String,
    password: String
});

credentialsSchema.index({email: 1}, {unique : true});

var credentialsModel = mongoose.model('Credentials', credentialsSchema);


/**
 * Method in charge of finding a user based on the criteria passed by parameter.
 * @param criteria The criteria object passed by parameter.
 * @param cb The callback method that will be executed after the search finishes.
 */
function findBy(criteria, cb){
    credentialsModel.findOne(criteria,
        function (err, credential){
            if (err){
                err = {server:config.service_friendly_name, http_status:500, status:{ message: "There was a problem trying to find the credential, please try again later." }, original: err};
            }
            if (cb){
                cb(err, credential);
            }
        }
    )
}

/**
 * Saves the user into the data store.
 * @param user The user we are trying to store.
 * @param cb The callback method that will be executed after the store.
 */
function saveEntity(credential, cb){
    credential.save(function(err){
        if (err){
            err = {server:config.service_friendly_name, http_status:500, status:{ message: "There was a problem saving the credential, please try again later."}, original: err}
        }
        if (cb){
            cb(err, credential);
        }
    })
}

module.exports = {
    CredentialsModel: credentialsModel,
    saveEntity: saveEntity,
    findBy: findBy
}

