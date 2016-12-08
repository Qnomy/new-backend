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
	members: [{_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, active: Boolean}],
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
	vsChatRoomModel.findOne(
		{$and:[{'members._user': members[0]}, {'members._user': members[1]}]},
		{'members.$':1}, 
		function(err, room){
			if(!room){
				room = new vsChatRoomModel({
					members: [{
						_user: members[0]
					},{
						_user: members[1]
					}]
				});
			}
			_.each(room.members, function(member){
				member.active = true;
			});
			room.save(function(err){
				return cb(err, room);
			})
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

function getRoomWithMembers(room, cb){
	vsChatRoomModel.findOne({_id:room._id})
    .populate({path: 'members', populate: {path: '_user'}})
    .exec(function(err, result){
    	if(!err){
    		cb(err, result);
    	}else{
    		cb(err);
    	}
    });
}

function blockMember(room, user, cb){
	getRoomWithMembers(room, function(err, room){
		var member = _.find(room.members, function(member){
			return member._user._id.toString() == user._id
		});
		if(!member){
			return cb('The user is not a member of this room');
		};
		member.active = false;
		room.save(function(err){
			cb(err, room);
		});
	});
}

module.exports = {
	getRoom: getRoom,
	getMembersRoom: getMembersRoom,
	getMessage: getMessage,
	addMessage: addMessage,
	getMessages: getMessages,
	removeMessage: removeMessage,
	blockMember: blockMember
}