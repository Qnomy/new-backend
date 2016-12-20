var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var config = require('../config/config');
var async = require('async');
var events = require('events');
var contentHandler = require('./content');
var bubbleCommentHandler = require('./bubble/bubble_comment');
var _ = require('underscore');

var bubbleEmitter = new events.EventEmitter();

var bubbleMemberSchema = mongoose.Schema({
	_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	active: {type: Boolean, default: true}
});

bubbleMemberSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
    	delete ret._id;
    	ret.user = doc._user;
    	delete ret._user;
    	return ret;
    }
});

var bubbleSchema = mongoose.Schema({
    _geoContent: {type: mongoose.Schema.Types.ObjectId, ref: 'GeoContent'},
    _owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    members: [bubbleMemberSchema],
    _comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'bubble_comment'}]
});

bubbleSchema.virtual('comments_count').get(function(){
	if(this._comments){
		return this._comments.length
	}else{
		return undefined;
	}
});

bubbleSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
    	delete ret._id;
    	delete ret.__v;
    	ret.geoContent = doc._geoContent;
    	delete ret._geoContent;
    	delete ret._comments;
    	ret.owner = doc._owner;
    	delete ret._owner;
    	return ret;
    }
});

bubbleSchema.index({ _geoContent: 1 }, { unique: true });
bubbleSchema.index({ _owner: 1 }, { unique: false });

var bubbleModel = mongoose.model('bubble', bubbleSchema); 

function updateBubble(geoContentId, bubble, cb){
	bubbleModel.update({_geoContent: geoContentId}, bubble,{upsert: true}, function(err, bubble){
		cb(err, bubble);
	});
}

function getBubble(bubble_id, cb){
	bubbleModel.findOne({_id: bubble_id}, function(err, bubble){
		cb(err, bubble);
	});
}

function getBubbleByGeoContentId(geoContentId, cb){
	bubbleModel.findOne({_geoContent: geoContentId}, function(err, bubble){
		if(err){
			return cb(err);
		}
		if(!bubble){
			var bubble = new bubbleModel();
			bubble._geoContent = geoContentId;
			bubble.save(function(err){
				return cb(err, bubble);
			})
		}else{
			cb(null, bubble);
		}
	})
}

function joinBubble(bubble, user, cb){
	getPopulatedBubble(bubble, function(err, bubble){
		if(err){
			return cb(err)
		}else{
			if(bubble.members.length == 0){
		        bubble._owner = user._id;
		    }

		    var member = _.find(bubble.members,function(member){
		    	return member._user._id.toString() == user._id;
		    });
		    if(!member) {
		    	member = {
		    		_user: user._id
		    	};
		    	bubble.members.push(member);
			};
			member.active = true;
			bubble.save(function(err){
		    	if(!err){
		    		bubbleEmitter.emit('join', bubble, user);
		    	}
		    	return cb(err, bubble);
		    });
		}
	});
}

function getPopulatedBubble(bubble, cb){
	bubbleModel.findOne({_id:bubble._id})
    .populate({path: 'members', populate: {path: '_user', select: 'display_name display_pic'}})
    .populate('_owner', 'display_name display_pic')
    .populate('_geoContent')
    .exec(function(err, result){
    	if(!err){
    		cb(err, result);
    	}else{
    		cb(err);
    	}
    })
}

function getBubbleMembers(bubble, cb){
	getPopulatedBubble(bubble, function(err, bubble){
		if(!err){
    		return cb(err, bubble.members);
    	}else{
    		return cb(err);
    	}
	});
}

function removeBubble(bubble, cb){
	async.series([function(callback){
		return bubbleCommentHandler.removeBubbleMessages(bubble,callback);
	}, function(callback){
		return bubble.remove(callback);
	}], function(err, result){
		return cb(err, result);
	});
}

function disconectBubble(bubble, cb){
	async.waterfall([function(callback){
		return contentHandler.getGeoContent(bubble._geoContent, function(err, geoContent){
			callback(err, geoContent);
		});
	}, function(geoContent, callback){
		return contentHandler.disconnectGeoContentBubble(geoContent, function(err, result){
			callback(err, result);
		})
	}, function(result, callback){
		return removeBubble(bubble, function(err, result){
			callback(err, result);
		});
	}], function(err, result){
		return cb(err, result);
	})
}

function blockBubble(bubble, user, cb){
	getPopulatedBubble(bubble, function(err, bubble){
		if(err){
			return cb(err);
		}else{
			var member = _.find(bubble.members, function(member){
				return member._user._id.toString() == user._id;
			});
			if(!member){
				return cb('the user is not a member of this bubble');
			}
			member.active = false;
			return bubble.save(cb);
		}
	});
}

module.exports = {
	bubbleModel: bubbleModel,
	emitter: bubbleEmitter,
	joinBubble: joinBubble,
	disconectBubble: disconectBubble,
	blockBubble: blockBubble,
	getBubble: getBubble,
	getBubbleByGeoContentId: getBubbleByGeoContentId,
	getBubbleMembers: getBubbleMembers
};