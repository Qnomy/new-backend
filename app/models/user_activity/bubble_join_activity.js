
function collectActivityInfo(activity, cb){
	var bubbleHandler = require('../bubble');
	bubbleHandler.getBubble(activity.source_id, function(err, bubble){
		if(!err && activity){
			activity.body = bubble;
		}
		return cb(activity);
	})
}

function createNotification(activity, cb){
	var userHandler = require('../user');
	userHandler.getUser(activity.actor, function(err, user){
		if(!err){
			return cb(null, {
				key: 'bubble-' + activity.body._id,
				subject: 'Bubble join notification',
				message: user.display_name + ' joind the bubble'
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