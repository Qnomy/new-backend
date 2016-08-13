var mongoose = require('mongoose');
var config = require('../../config/config');
var async = require('async');
var schema = mongoose.Schema;

var bubbleMessageSchema = mongoose.Schema({
    bubble_id: String,
    from: String,
    body: schema.Types.Mixed,
    created_date : {type: Number, default: (new Date()).getTime()}
});

bubbleMessageSchema.index({ bubble_id: 1}, { unique: false });

bubbleMessageModel = mongoose.model('bubblemessag', bubbleMessageSchema);

function getBubbleMessages(bubble, last, limit, cb){
	var query = bubbleMessageModel.find({bubble_id: bubble._id});
	if(last){
		query.where({created_date: {$lte: last.created_date}});
	}
	query.sort('-created_date');
	query.limit(limit || config.rest_api.page_limit);
	query.exec(function(err, results){
		cb(err, results);
	});
}

function addBubbleMessage(bubble, user, body, cb){
	var message = new bubbleMessageModel({
		bubble_id: bubble._id,
		from: user._id,
		body: body
	});
	message.save(function(err){
		return cb(err, message);
	})
}

module.exports = {
	getBubbleMessages: getBubbleMessages,
	addBubbleMessage: addBubbleMessage
}