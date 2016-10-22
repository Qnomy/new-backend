
function collectActivityInfo(activity, cb){
	var bubbleMessageHandler = require('../bubble/bubble_message');
	bubbleMessageHandler.getBubbleMessage(activity.source_id, function(err, message){
		if(!err && message){
			activity.body = message;
		}
		return cb(err, activity);
	});
}

function createNotification(activity, cb){
	var userHandler = require('../user');
	userHandler.getUser(activity.actor, function(err, user){
		if(!err){
			return cb(null, {
				key: 'bubble-' + activity.body._bubble,
				subject: 'Bubble comment notification',
				message: user.display_name + ' commented on a buubble you are a member of'
			});
		}else{
			return cb(err);
		}
	});
}

module.exports = {
	collectActivityInfo: collectActivityInfo,
	createNotification: createNotification
}