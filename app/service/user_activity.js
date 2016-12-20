var userActivityHandler = require('../models/user_activity');
var bubbleHandler = require('../models/bubble');
var bubbleCommentHandler = require('../models/bubble/bubble_comment');
var logger = require('../util/logger');

bubbleHandler.emitter.on('join', function(bubble, user){
	createActivity(
		userActivityHandler.ActivityTypes.bubbleJoin, 
		bubble,
		user);
});

bubbleCommentHandler.emitter.on('comment', function(comment, user){
	createActivity(
		userActivityHandler.ActivityTypes.bubbleComment, 
		comment,
		user);
});

function createActivity(type, source, user){
	userActivityHandler.createActivity(type, user, source);
};