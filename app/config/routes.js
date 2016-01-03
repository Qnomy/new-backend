/**
 * Created by alan on 12/17/15.
 */
var express = require('express');
var usersController = require('../controllers/users');
var statusController = require('../controllers/status');


/* Middleware definitions */
var socialFacebookValidationMiddleware = require('../middlewares/social_facebook_validation');
var socialTwitterValidationMiddleware = require('../middlewares/social_twitter_validation');
var socialInstagramValidationMiddleware = require('../middlewares/social_instagram_validation');

var authorizationMiddleware = require('../middlewares/authorization');

/* Middleware definitions aggregations */
var socialFacebookMiddlewares=[socialFacebookValidationMiddleware.validate_schema, socialFacebookValidationMiddleware.validate_user_existance_by_token];
var socialTwitterMiddlewares=[socialTwitterValidationMiddleware.validate_schema, socialTwitterValidationMiddleware.validate_user_existance_by_token];
var socialInstagramMiddlewares=[socialInstagramValidationMiddleware.validate_schema, socialInstagramValidationMiddleware.validate_user_existance_by_token];

var authorizationMiddlewareList = [authorizationMiddleware.token_loader, authorizationMiddleware.caller_loader, authorizationMiddleware.token_access_validation];


module.exports = function (app) {

    /* field dependencies */
    var router = express.Router();

    // Login methods.
    router.post('/login-social/facebook', socialFacebookMiddlewares, function (req, res){
        usersController.login_social(req, res, AccountTypes.Facebook);
    });

    router.post('/login-social/twitter', socialTwitterMiddlewares, function (req, res){
        usersController.login_social(req, res, AccountTypes.Twitter);
    });

    router.post('/login-social/instagram', socialInstagramMiddlewares, function (req, res){
        usersController.login_social(req, res, AccountTypes.Instagram);
    });

    // Gets a user by its identifier and by its account type and social id.
    router.get('/user/:uid', authorizationMiddlewareList, function (req, res){
        usersController.get_user(req, res, { '_id': req.params.uid });
    });

    router.get('/user/:accountType/:socialId', authorizationMiddlewareList, function (req, res){
        usersController.get_user(req, res, { 'accounts.social_id': req.params.socialId, 'accounts.type': req.params.accountType });
    });


    app.use('',statusController);
    app.use('/auth/v1',router);
};