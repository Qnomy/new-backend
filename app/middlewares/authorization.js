var UserModel = require('../models/user').UserModel;
var RoleTypes = require('../models/user').RoleTypes;
var jwt = require('jsonwebtoken');
var config = require('../config/config');

/**
 * This function actually loads the caller user into the request object.
 * This function needs the token loader before being called since it relies on
 * having the authorization key setted up.
 * @param req
 * @param res
 * @param next
 */
module.exports.caller_loader = function (req, res, next){
    UserModel.findOne({ '_id': req.params.token_payload.uid },
        function (err, user){
            req.params.user_caller = user;
            next();
        }
    )
};

/**
 * Tries to load a token and set it up as a parameter in the request.
 * First it tries to load the header, and later on via querystring parameter.
 * if its not found, it will return a 401 api call is forbidden.
 *
 * Sets the req.params.authorization parameter to the current token.
 * @param req
 * @param res
 * @param next
 */
module.exports.token_loader = function(req, res, next){
    var token = req.headers['authorization'];
    if (token){
        token = token.split(" ").pop();
    }
    req.params.authorization = token;
    next();
};

/**
 * Validates that the token is not old.
 * @param req
 * @param res
 * @param next
 */
module.exports.credential_token_validation = function(req, res, next){
    var token = req.params.authorization;
    jwt.verify(token, config.jwt_token.credential_secret, config.jwt_token.options_credential, function(err, payload){
        if (err){
            res.status(401).json({server:config.service_friendly_name, http_status:401, status:{ message: "The credential token is not valid." }});
            res.end();
            return;
        }
        req.params.token_payload = payload;
        next();
    })
}


/**
 * Validates that the api is only accessible to the admin role.
 * @param req
 * @param res
 * @param next
 */
module.exports.only_admin_access = function(req, res, next){
    var caller = req.params.user_caller;
    if (!caller || !caller.role || caller.role != RoleTypes.Admin){
        res.status(401).json({server:"scarlett", http_status:401, status:{ message: "Api call is forbidden" }});
        res.end();
        return;
    }
    next();
};