/**
 * Created by alan on 1/3/16.
 */
var express = require('express');
var contentController = require('./content');

/* field dependencies */
var contentRouter = express.Router();

// Generate a signature to upload multimedia content.
contentRouter.post('/sign', contentController.signature);

// Content Api.
contentRouter.post('/post', contentController.post);
contentRouter.get('/post/:id', contentController.get);
contentRouter.get('/post', contentController.find);

// export the content router.
module.exports = contentRouter;