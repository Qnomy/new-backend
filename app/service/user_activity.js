var userActivityHandler = require('../models/user_activity');
var bubbleHandler = require('../models/bubble');
var bubbleMessageHandler = require('../models/bubble/bubble_message');
var logger = require('../util/logger');

bubbleHandler.emitter.on('join', function(bubble, user){
	createActivity(
		userActivityHandler.ActivityTypes.bubbleJoin, 
		bubble,
		user);
});

bubbleMessageHandler.emitter.on('comment', function(message, user){
	createActivity(
		userActivityHandler.ActivityTypes.bubbleComment, 
		message,
		user);
});

function createActivity(type, source, user){
	userActivityHandler.createActivity(type, user, source);
};