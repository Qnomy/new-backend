/**
 * Created by alan on 1/13/16.
 */
var jwt = require('jsonwebtoken');
var config = require('../config/config');
/**
 * Response the created user entity to the client.
 * @param req The request object from where we need the information from the request.
 * @param res The response object used to response the information to the client.
 * @param err An error variable to be evaluated to see what to answer to the client.
 * @param user The user we stored previously.
 */
function buildTokens(user, cb){
    // Generate two tokens:
    // a. An out of date token that will be exchanged on every call.
    // b. A refresh token that has no out of date.
    var dailyTokenPayload = {
        id: user.id,
        role: user.role,
        token_type: config.tokenType.dailyToken
    };

    jwt.sign(dailyTokenPayload, config.jwt_token.daily_secret, config.jwt_token.options_daily, function(dailyToken) {
        var refreshTokenPayload = {
            id: user.id,
            role: user.role,
            token_type: config.tokenType.refreshToken
        };
        jwt.sign(refreshTokenPayload, config.jwt_token.refresh_secret, config.jwt_token.options_refresh, function(refreshToken) {
            cb(null, { has_accounts:false, token: dailyToken, refresh_token: refreshToken });
        });
    });

}

/**
 * Method in charge of creating credentials token for the user to be able to login into the system.
 * @param credential The credentials passed by parameter
 * @param cb A callback function that will get the credentials token by parameter.
 */
function buildCredentialTokens(rnd, role, cb){
    var credentialTokenPayload = {
        rnd: rnd,
        role: role,
        token_type: config.tokenType.credentialToken
    }
    jwt.sign(credentialTokenPayload, config.jwt_token.credential_secret, config.jwt_token.options_credential, function(credentialsToken) {
        cb(null, {
            token: credentialsToken
        });
     });
}

module.exports = {
    buildTokens: buildTokens,
    buildCredentialTokens: buildCredentialTokens
}
