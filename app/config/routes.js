/**
 * Created by alan on 12/17/15.
 */
var express = require('express');
//var usersController = require('../controllers/users');
//var credentialsController = require('../controllers/credentials/credentials');


var authController = require('../controllers/auth');
var contentController = require('../controllers/content/content');

var statusController = require('../controllers/status');

//var authorizationMiddleware = require('../middlewares/authorization');
//
//var verifyMiddleware = [authorizationMiddleware.token_loader, authorizationMiddleware.credential_token_validation];

module.exports = function (app) {

    /* field dependencies */
    var authRouter = express.Router();

    authRouter.post('/register', authController.register);
    authRouter.post('/verify', authController.verify);
    authRouter.get('/:uid', authController.get);

    authRouter.post('/:uid', authController.post);

    //authRouter.post('/init-account/:uid', authController.init_account);

    authRouter.post('/account/:uid', authController.post_account);
    authRouter.get('/account/:uid', authController.get_accounts);
    //authRouter.get('/account/:uid/aid', authController.get_account);


    var contentRouter = express.Router();

    contentRouter.post('/:uid',contentController.post);
    contentRouter.get('/:longitude/:latitude/:min_distance/:max_distance',contentController.search);
    contentRouter.get('/:cid',contentController.get);

    //router.get('/account/:uid', authController.get_accounts);

    //
    ///* Login with user credentials */
    //router.post('/login', credentialsController.login);
    //router.get('/credentials/:email', credentialsController.get);
    //
    ///* Create a User profile. */
    //router.post('/register', usersController.register);
    //router.post('/verify', usersController.verify);
    //
    //router.get('/users', usersController.find);
    //router.get('/users/:uid', function(req, res){
    //    usersController.get(req, res, { '_id': req.params.uid });
    //});
    //router.get('/users/:accountType/:socialId', function (req, res){
    //    usersController.get(req, res, { 'accounts.social_id': req.params.socialId, 'accounts.type': req.params.accountType });
    //});
    //
    ///* Append social accounts to the user. */
    //router.post('/accounts/facebook',function(req, res){
    //    usersController.addSocialAccount(req, res, AccountTypes.Facebook);
    //});
    //
    //router.post('/accounts/twitter',function(req, res){
    //    usersController.addSocialAccount(req, res, AccountTypes.Twitter);
    //});
    //
    //router.post('/accounts/instagram',function(req, res){
    //    usersController.addSocialAccount(req, res, AccountTypes.Instagram);
    //});
    //

    app.use('',statusController);
    app.use('/v1/auth',authRouter);
    app.use('/v1/content',contentRouter);
};