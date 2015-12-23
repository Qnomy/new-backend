var UserModel = require('../models/user').UserModel;
var RoleTypes = require('../models/user').RoleTypes;

/**
 * This function actually loads the caller user into the request object.
 * This function needs the token loader before being called since it relies on
 * having the authorization key setted up.
 * @param req
 * @param res
 * @param next
 */
module.exports.caller_loader = function (req, res, next){
    UserModel.findOne({ 'token': req.params.authorization },
        function (err, user){
            req.params.user_caller = user;
            next();
        }
    )
}

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
    if (!token){
        // try to get it from the querystring.
        token = req.query.authorization;
    }
    req.params.authorization = token;
    next();
};

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

/**
 * Validates that there is a caller user and that the token is not old.
 * @param req
 * @param res
 * @param next
 */
module.exports.token_access_validation = function(req, res, next){
    var caller = req.params.user_caller;
    if (!caller || (new Date()).getTime() > caller.token_expiration){
        res.status(401).json({server:"scarlett", http_status:401, status:{ message: "The access token or refresh token are not valid." }});
        res.end();
        return;
    };
    next();
};