var mongoose = require('mongoose');
var bubbleHandler = require('../bubble');
var userHandler = require('../user');
var config = require('../../config/config');
var async = require('async');
var schema = mongoose.Schema;
var events = require('events');

var bubbleCommentEmitter = new events.EventEmitter();

var bubbleCommentSchema = mongoose.Schema({
    _bubble: {type: mongoose.Schema.Types.ObjectId, ref: 'bubble'},
    _from: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    body: schema.Types.Mixed,
    created_date : {type: Date, default: Date.now}
});

bubbleCommentSchema.post('save', function(comment){
	userHandler.getUser(comment._from, function(err, user){
		bubbleCommentEmitter.emit('comment', comment, user);
	});
});

bubbleCommentSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
    	delete ret._id;
    	delete ret.__v;
    	ret.bubble = doc._bubble;
    	delete ret._bubble;
    	ret.from = doc._from;
    	delete ret._from;
    	return ret;
    }
});

bubbleCommentSchema.index({ _from: 1}, { unique: false });


bubbleCommentModel = mongoose.model('bubble_comment', bubbleCommentSchema);

function getBubbleComments(bubble, last, limit, cb){
	var query = bubbleCommentModel.find({_bubble: bubble._id});
	if(last){
		query.where({created_date: {$lte: last.created_date}});
	}
	query.sort('+created_date');
	query.limit(limit || config.rest_api.page_limit);
	query
	.populate('_from', 'display_name display_pic')
	query.exec(function(err, results){
		cb(err, results);
	});
}

function getBubbleComment(mid, cb){
	bubbleCommentModel.findOne({_id: mid}, function(err, comment){
		cb(err, comment);
	})
}

function getPopulatedBubbleComment(mid, cb){
	var query = bubbleCommentModel.findOne({_id: mid})
	.populate('_from', 'display_name display_pic')
	.populate('_bubble');
	query.exec(function(err, comment){
		cb(err, comment);
	});
}

function addBubbleComment(bubble, user, body, cb){
	var comment = new bubbleCommentModel({
		_bubble: bubble._id,
		_from: user._id,
		body: body
	});
	comment.save(function(err){
		if(!err){
			bubble._comments.push(comment);
			bubble.save(function(err){
				return cb(err, comment);
			})
		}else{
			return cb(err, null);
		}
	});
}

function removeBubbleComments(bubble, cb){
	return bubbleCommentModel.remove({'_bubble': bubble}, cb);
}

module.exports = {
	getBubbleComments: getBubbleComments,
	getBubbleComment: getBubbleComment,
	getPopulatedBubbleComment: getPopulatedBubbleComment,
	addBubbleComment: addBubbleComment,
	removeBubbleMessages: removeBubbleComments,
	emitter: bubbleCommentEmitter,
}