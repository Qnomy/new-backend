var mongoose = require('mongoose');
var schema = mongoose.Schema;
var config = require('../config/config');
var async = require('async');
var bubbleJoinActivityHandler = require('./user_activity/bubble_join_activity');
var bubbleCommentActivityHandler = require('./user_activity/bubble_comment_activity');
var snsHandler = require('../service/sns');

var userActivitySchema = mongoose.Schema({
	type: Number,
	actor: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	source_id: String,
	loc: {
        type: {type: String, default: 'Point'}, 
        coordinates: {type: [Number], default: [0, 0]}    
	},
    altitude: {type: Number, default: 0},
    created_date : {type: Date, default: Date.now},
    body: schema.Types.Mixed
});

/*indexes*/
userActivitySchema.index({ actor: 1}, { unique: false});

/* Model definition */
var userActivityModel = mongoose.model('user_activity', userActivitySchema);

var ActivityTypes = {
	bubbleJoin: 1,
	bubbleComment: 2,
	vschatMessage: 3
};

function getActivityHandler(activity){
	switch(activity.type){
		case ActivityTypes.bubbleJoin:
			return bubbleJoinActivityHandler;
			break;
		case ActivityTypes.bubbleComment:
			return bubbleCommentActivityHandler;
			break;
		case ActivityTypes.vschatMessage:
		default:
			return null;
	}
}

function createActivity(type, user, source, cb){
	var activity = new userActivityModel();
	activity.type = type;
	activity.actor = user._id;
	activity.source_id = source._id; 
	activity.save(function(err){
		if(cb){
			cb(err, activity);
		}
	});
}

function getUserActivity(uid, cb){
	userActivityModel.findOne({'actor': uid}, cb);
}

function getUserActivities(user, last, limit, cb){
	var query = userActivityModel.find({'actor': user._id});
	if(last){
		query.where({created_date: {$lte: last.created_date}});
	}
	query.sort('-created_date');
	query.limit(limit || config.rest_api.page_limit);
	query.exec(cb);
}

userActivitySchema.pre('save', function(next){
	var activityHandler = getActivityHandler(this);
	activityHandler.collectActivityInfo(this, next);
});

userActivitySchema.post('save', function(activity){
	var activityHandler = getActivityHandler(this);
	async.waterfall([function(callback){
		activityHandler.createNotification(activity, callback);
	}, function(notification, callback){
		snsHandler.sendNotification(notification, callback);
	}]);
});


module.exports = {
	ActivityTypes: ActivityTypes,
	createActivity: createActivity,
	getUserActivity: getUserActivity,
	getUserActivities: getUserActivities
}