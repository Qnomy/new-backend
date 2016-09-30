var _ = require('underscore');
var activityDbHandler = require('../models/activity');

var subscribers = [];
var activityTypes = {
	bubbleJoin: 1,
	bubbleComment: 2,
	vschatMessage: 3
}

function createActivity(type, actor, source){
	/*switch(type){
		case activityTypes.bubbleJoin:

	}*/
}

function persistActivity(activity, cb){
	activityDbHandler.saveActivity(activity, cb);
}

function subscribe(name, types, cb){
	subscribers.push({
		name: name,
		types: types,
		cb: cb
	});
}

function publish(activity){
	_.each(subscribers, function(subscriber){
		if(subscriber.type == activity.type){
			activity.cb(activity);
		}
	})
}


