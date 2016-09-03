var mongoose = require('mongoose');
var schema = mongoose.Schema;
var async = require('async');
var config = require('../config/config');
var _ = require('underscore');

var vsChatMessageSchema = mongoose.Schema({
	from: String,
	body: String,
	created_date: { type: Date, default: Date.now }
});

var vsChatRoomSchema = mongoose.Schema({
	members: [String],
	messages: [vsChatMessageSchema]
});

vsChatRoomSchema.index({ members: 1 }, { unique: true });

var vsChatRoomModel = mongoose.model('vschatroom', vsChatRoomSchema);

function getRoom(room_id, cb){
	vsChatRoomModel.findOne({_id:room_id}, function(err, room){
		return cb(err, room);
	});
}

function getMembersRoom(members, cb){
	vsChatRoomModel.findOne({members:members},{messages:false}, function(err, room){
		if(!room){
			var room = new vsChatRoomModel({
				members: members
			});
			room.save(function(err){
				return cb(err, room);
			})
		}else{
			return cb(err, room);
		}
	});
}

function getMessage(room, mid){
	return room.messages.id(mid);
}

function getMessages(room, last, limit, cb){
	var messages = room.messages;
	if(last){
		messages = _.filter(messages, function(message){
			return message.created_date > last.created_date;
		});
	}
	messages = _.sortBy(messages, 'created_date');
	var limit = limit || config.rest_api.page_limit;
	if(limit > messages.length){
		limit = messages.length;
	}
	return cb(null, messages.slice(0, limit));
}

function addMessage(room, user, body, cb){
	room.messages.push({
		from: user._id,
		body: body
	});
	room.save(function(err){
		return cb(err, room.messages[room.messages.length-1]);
	});
}

function removeMessage(room, mid, cb){
	var message = room.message.id(mid).remove();
	room.save(err, function(err){
		return cb(err, message);
	});
}

module.exports = {
	getRoom: getRoom,
	getMembersRoom: getMembersRoom,
	getMessage: getMessage,
	addMessage: addMessage,
	getMessages: getMessages,
	removeMessage: removeMessage
}