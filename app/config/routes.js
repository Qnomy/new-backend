/**
 * Created by alan on 12/17/15.
 */
var express = require('express');
//var usersController = require('../controllers/users');
//var credentialsController = require('../controllers/credentials/credentials');


var authController = require('../controllers/auth');
var contentController = require('../controllers/content/content');
var bubbleController = require('../controllers/bubble');
var fbWebhookController = require('../controllers/fbwebhook');

var statusController = require('../controllers/status');

var authorizationMiddleware = require('../middlewares/authorization');

var verifyMiddleware = [authorizationMiddleware.token_loader, authorizationMiddleware.token_validation];

module.exports = function (app) {

    /* field dependencies */
    var authRouter = express.Router();

    authRouter.post('/register', authController.register);
    authRouter.post('/verify', authController.verify);
    authRouter.get('/:uid', verifyMiddleware, authController.get);

    authRouter.post('/:uid', verifyMiddleware, authController.post);

    //authRouter.post('/init-account/:uid', authController.init_account);

    authRouter.post('/account/:uid', verifyMiddleware, authController.post_account);
    authRouter.get('/account/:uid', verifyMiddleware ,authController.get_accounts);
    //authRouter.get('/account/:uid/aid', authController.get_account);
    authRouter.post('/update-location/:uid', verifyMiddleware, authController.updateLocation);

    var contentRouter = express.Router();

    contentRouter.post('/:uid',verifyMiddleware, contentController.post);
    contentRouter.get('/:longitude/:latitude/:min_distance/:max_distance',verifyMiddleware, contentController.search);
    contentRouter.get('/:cid',verifyMiddleware, contentController.get);
    contentRouter.get("/browse/demo", function (req, res) {res.sendFile(__dirname + '/public/GeoContent.json')});

    var bubbleRouter = express.Router();
    bubbleRouter.post('/join/:cid',verifyMiddleware, bubbleController.join);
    bubbleRouter.get('/messages/:bid/:last?/:limit?',verifyMiddleware, bubbleController.getBubbleMessages);
    bubbleRouter.post('/message/:bid',verifyMiddleware, bubbleController.addBubbleMessage);

    var fbWebhookRouter = express.Router();
    fbWebhookRouter.get('/callback', fbWebhookController.get);
    fbWebhookRouter.post('/callback', fbWebhookController.post);

    app.use('',statusController);
    app.use('/v1/auth',authRouter);
    app.post('/v1/upload/sign',contentController.signature);
    app.use('/v1/content',contentRouter);
    app.use('/v1/bubble', bubbleRouter);
    app.use('/v1/fbwebhook',fbWebhookRouter);
};