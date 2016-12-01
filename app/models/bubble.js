var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var config = require('../config/config');
var async = require('async');
var events = require('events');
var contentHandler = require('./content');

var bubbleEmitter = new events.EventEmitter();

var bubbleSchema = mongoose.Schema({
    geoContentId: {type: mongoose.Schema.Types.ObjectId, ref: 'GeoContent'},
    owner: {type: String, default: null},
    _members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
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

bubbleSchema.index({ geoContentId: 1 }, { unique: true });
bubbleSchema.index({ owner: 1 }, { unique: false });

var bubbleModel = mongoose.model('bubble', bubbleSchema); 

function updateBubble(geoContentId, bubble, cb){
	bubbleModel.update({geoContentId: geoContentId}, bubble,{upsert: true}, function(err, bubble){
		cb(err, bubble);
	});
}

function getBubble(bubble_id, cb){
	bubbleModel.findOne({_id: bubble_id}, function(err, bubble){
		cb(err, bubble);
	});
}

function getBubbleByGeoContentId(geoContentId, cb){
	bubbleModel.findOne({geoContentId: geoContentId}, function(err, bubble){
		if(err){
			return cb(err);
		}
		if(!bubble){
			var bubble = new bubbleModel();
			bubble.geoContentId = geoContentId;
			bubble.save(function(err){
				return cb(err, bubble);
			})
		}else{
			cb(null, bubble);
		}
	})
}

function joinBubble(bubble, user, cb){
    if(bubble._members.length == 0){
        bubble.owner = user._id;
    }
    if(bubble._members.indexOf(user._id) < 0) {
    	bubble._members.push(user._id);
	    bubble.save(function(err){
	    	if(!err){
	    		bubbleEmitter.emit('join', bubble, user);
	    	}
	    	return cb(err, bubble);
	    });
	}else{
		return cb(null, bubble);
	}
}

function getBubbleMembers(bubble, cb){
	bubbleModel.findOne({_id:bubble._id})
    .populate('_members', 'display_name display_pic')
    .exec(function(err, result){
    	if(!err){
    		cb(err, result._members);
    	}else{
    		cb(err);
    	}
    })
}

function disconectBubble(bubble, cb){
	async.waterfall([function(callback){
		contentHandler.getGeoContent(bubble.geoContentId, function(err, geoContent){
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

module.exports = {
	bubbleModel: bubbleModel,
	emitter: bubbleEmitter,
	joinBubble: joinBubble,
	getBubble: getBubble,
	getBubbleByGeoContentId: getBubbleByGeoContentId,
	getBubbleMembers: getBubbleMembers
};