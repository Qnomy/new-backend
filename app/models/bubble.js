var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var config = require('../config/config');
var async = require('async');
var events = require('events');
var contentHandler = require('./content');
var _ = require('underscore');

var bubbleEmitter = new events.EventEmitter();

var bubbleSchema = mongoose.Schema({
    _geoContentId: {type: mongoose.Schema.Types.ObjectId, ref: 'GeoContent'},
    _owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    members: [{_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, active: {type: Boolean, default: true}}],
    _messages: [{type: mongoose.Schema.Types.ObjectId, ref: 'bubble_message'}]
});

bubbleSchema.virtual('messages_count').get(function(){
	return this._messages.length;
});

bubbleSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
    	delete ret._messages;
    	return ret;
    }
});

//bubbleSchema.index({ _geoContentId: 1 }, { unique: true });
bubbleSchema.index({ _owner: 1 }, { unique: false });

var bubbleModel = mongoose.model('bubble', bubbleSchema); 

function updateBubble(geoContentId, bubble, cb){
	bubbleModel.update({_geoContentId: geoContentId}, bubble,{upsert: true}, function(err, bubble){
		cb(err, bubble);
	});
}

function getBubble(bubble_id, cb){
	bubbleModel.findOne({_id: bubble_id}, function(err, bubble){
		cb(err, bubble);
	});
}

function getBubbleByGeoContentId(geoContentId, cb){
	bubbleModel.findOne({_geoContentId: geoContentId}, function(err, bubble){
		if(err){
			return cb(err);
		}
		if(!bubble){
			var bubble = new bubbleModel();
			bubble._geoContentId = geoContentId;
			bubble.save(function(err){
				return cb(err, bubble);
			})
		}else{
			cb(null, bubble);
		}
	})
}

function joinBubble(bubble, user, cb){
	getBubbleWithMembers(bubble, function(err, bubble){
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

function getBubbleWithMembers(bubble, cb){
	bubbleModel.findOne({_id:bubble._id})
    .populate({path: 'members', populate: {path: '_user', select: 'display_name display_pic'}})
    .exec(function(err, result){
    	if(!err){
    		cb(err, result);
    	}else{
    		cb(err);
    	}
    })
}

function getBubbleMembers(bubble, cb){
	getBubbleWithMembers(bubble, function(err, bubble){
		if(!err){
    		return cb(err, bubble.members);
    	}else{
    		return cb(err);
    	}
	});
}

function disconectBubble(bubble, cb){
	async.waterfall([function(callback){
		contentHandler.getGeoContent(bubble._geoContentId, function(err, geoContent){
			return callback(err, geoContent);
		});
	}, function(geoContent, callback){
		contentHandler.disconnectGeoContentBubble(geoContent, function(err, result){
			return callback(err, result);
		})
	}], function(err, result){
		return cb(err, result);
	})
}

function blockBubble(bubble, user, cb){
	getBubbleWithMembers(bubble, function(err, bubble){
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
	blockBubble: blockBubble,
	getBubble: getBubble,
	getBubbleByGeoContentId: getBubbleByGeoContentId,
	getBubbleMembers: getBubbleMembers
};