/**
 * Created by alan on 12/17/15.
 */
var express = require('express');
//var usersController = require('../controllers/users');
//var credentialsController = require('../controllers/credentials/credentials');


var authController = require('../controllers/auth');
var contentController = require('../controllers/content/content');
var fbWebhookController = require('../controllers/fbwebhook');

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

    var fbWebhookRouter = express.Router();
    fbWebhookRouter.get('/callback', fbWebhookController.get);
    fbWebhookRouter.post('/callback', fbWebhookController.post);
    fbWebhookRouter.get('/process-pending', fbWebhookController.processPending);

    app.use('',statusController);
    app.use('/v1/auth',authRouter);
    app.post('/v1/upload/sign',contentController.signature);
    app.use('/v1/content',contentRouter);
    app.use('/v1/fbwebhook',fbWebhookRouter);
};