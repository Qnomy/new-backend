var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var config = require('../config/config');
var async = require('async');

var bubbleSchema = mongoose.Schema({
    geoContentId: String,
    owner: {type: String, default: null},
    members: [{type: String, default: null}],
    _messages: [{type: mongoose.Schema.Types.ObjectId, ref: 'bubble_message'}]
});

bubbleSchema.virtual('messages_count').get(function(){
	return this._messages.length;
});

bubbleSchema.set('toJSON', {
    virtuals: true
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
    if(bubble.members.length == 0){
        bubble.owner = user._id;
    }
    if(bubble.members.indexOf(user._id) < 0) {
    	bubble.members.push(user._id);
	    bubble.save(function(err){
	    	return cb(err, bubble);
	    });
	}else{
		return cb(null, bubble);
	}
}

module.exports = {
	bubbleModel: bubbleModel,
	joinBubble: joinBubble,
	getBubble: getBubble,
	getBubbleByGeoContentId: getBubbleByGeoContentId
};