/**
 * Created by alan on 12/17/15.
 */
var express = require('express');
//var credentialsController = require('../controllers/credentials/credentials');


var authController = require('../controllers/auth');
var userController = require('../controllers/user');
var contentController = require('../controllers/content/content');
var bubbleController = require('../controllers/bubble');
var vschatController = require('../controllers/vschat');
var fbWebhookController = require('../controllers/fbwebhook');

var statusController = require('../controllers/status');

var authorizationMiddleware = require('../middlewares/authorization');

var verifyMiddleware = [authorizationMiddleware.token_loader, authorizationMiddleware.token_validation];

module.exports = function (app) {

    /* field dependencies */
    var authRouter = express.Router();

    authRouter.post('/register', authController.register);
    authRouter.post('/verify', authController.verify);

    var userRouter = express.Router();
    userRouter.get('/:uid', verifyMiddleware, userController.getUser);
    userRouter.post('/:uid', verifyMiddleware, userController.setUser);
    userRouter.post('/:uid/account', verifyMiddleware, userController.addSocialAccount);
    userRouter.get('/:uid/accounts', verifyMiddleware ,userController.getSocialAccounts);
    userRouter.post('/:uid/device/register', verifyMiddleware, userController.registerUserDevice);
    userRouter.get('/:uid/activities/:last?/:limit?', verifyMiddleware, userController.getUserActivities);
    userRouter.post('/:uid/update-location', verifyMiddleware, userController.updateLocation);

    var contentRouter = express.Router();
    contentRouter.post('/:uid',verifyMiddleware, contentController.post);
    contentRouter.get('/:longitude/:latitude/:max_distance?/:last?',verifyMiddleware, contentController.search);
    contentRouter.get('/:cid',verifyMiddleware, contentController.get);
    contentRouter.get("/browse/demo", function (req, res) {res.sendFile(__dirname + '/public/GeoContent.json')});

    var bubbleRouter = express.Router();
    bubbleRouter.post('/:cid/join',verifyMiddleware, bubbleController.join);
    bubbleRouter.get('/:cid/comments/:last?',verifyMiddleware, bubbleController.getBubbleMessages);
    bubbleRouter.post('/:cid/comment',verifyMiddleware, bubbleController.addBubbleMessage);

    var vschatRouter = express.Router();
    vschatRouter.post('/join', verifyMiddleware, vschatController.createRoom)
    vschatRouter.post('/:rid', verifyMiddleware, vschatController.addMessage);
    vschatRouter.delete('/:rid/:mid', verifyMiddleware, vschatController.removeMessage);
    vschatRouter.get('/:rid/:last?', verifyMiddleware, vschatController.getMessages);

    var fbWebhookRouter = express.Router();
    fbWebhookRouter.get('/callback', fbWebhookController.get);
    fbWebhookRouter.post('/callback', fbWebhookController.post);

    app.use('',statusController);
    app.use('/v1/auth',authRouter);
    app.use('/v1/user', userRouter);
    app.post('/v1/upload/sign',contentController.signature);
    app.use('/v1/content',contentRouter);
    app.use('/v1/bubble', bubbleRouter);
    app.use('/v1/vschat', vschatRouter);
    app.use('/v1/fbwebhook',fbWebhookRouter);
};