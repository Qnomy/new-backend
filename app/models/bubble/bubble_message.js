var mongoose = require('mongoose');
var bubbleHandler = ('../bubble');
var config = require('../../config/config');
var async = require('async');
var schema = mongoose.Schema;

var bubbleMessageSchema = mongoose.Schema({
    _bubble: {type: mongoose.Schema.Types.ObjectId, ref: 'bubble'},
    from: String,
    body: schema.Types.Mixed,
    created_date : {type: Date, default: Date.now}
});

bubbleMessageSchema.index({ _bubble: 1}, { unique: false });

bubbleMessageModel = mongoose.model('bubble_message', bubbleMessageSchema);

function getBubbleMessages(bubble, last, limit, cb){
	var query = bubbleMessageModel.find({_bubble: bubble._id});
	if(last){
		query.where({created_date: {$lte: last.created_date}});
	}
	query.sort('-created_date');
	query.limit(limit || config.rest_api.page_limit);
	query.exec(function(err, results){
		cb(err, results);
	});
}

function getBubbleMessage(mid, cb){
	bubbleMessageModel.findOne({_id: mid}, function(err, message){
		cb(err, message);
	})
}

function addBubbleMessage(bubble, user, body, cb){
	var message = new bubbleMessageModel({
		_bubble: bubble._id,
		from: user._id,
		body: body
	});
	message.save(function(err){
		if(!err){
			bubble._messages.push(message);
			bubble.save(function(err){
				return cb(err, message);
			})
		}else{
			return cb(err, null);
		}
	});
}

module.exports = {
	getBubbleMessages: getBubbleMessages,
	getBubbleMessage: getBubbleMessage,
	addBubbleMessage: addBubbleMessage
}