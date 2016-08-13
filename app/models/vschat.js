var mongoose = require('mongoose');
var schema = mongoose.Schema;
var async = require('async');

var vsChatMessageSchema = mongoose.Schema({
	from: String,
	body: String,
	created_date: { type: Date, default: Date.now }
});

var vsChatRoomSchema = mongoose.Schema({
	members: [String],
	messages: [vsChatMessageSchema]
});

var vsChatRoomModel = mongoose.model('vschatroom', vsChatRoomSchema);

function getRoom(members, cb){
	vsChatRoomModel.findOne({members:members}, function(err, room){
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

function addMessage(room, user, body, cb){
	room.messages.push({
		from: user._id,
		body: body
	});

}

module.exports = {
	
}