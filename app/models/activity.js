var mongoose = require('mongoose');
var schema = mongoose.Schema;
var config = require('../config/config');

var activitySchema = mongoose.Schema({
	type: String,
	actor: String,
	target: [String],
	source_id: String,
	loc: {
        type: {type: String, default: 'Point'}, 
        coordinates: {type: [Number], default: [0, 0]}    
	},
    altitude: {type: Number, default: 0},
    created_date : {type: Number, default: (new Date()).getTime()},
    body: schema.Types.Mixed
});

/*indexes*/
activitySchema.index({ actor: 1}, { unique: false});

/* Model definition */
var activityModel = mongoose.model('activity', activitySchema);

function saveActivity(activity, cb){
	activity.save(function(err){
		cb(err, activity);
	});
}