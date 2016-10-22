var aws = require("aws-sdk");
var sns = new aws.SNS({apiVersion: '2010-03-31'});

function createEndpoint(platform, token, cb){
	//need to be implemented
	return cb('not implemented');
}

function getTopic(key, cb){
	return sns.createTopic({name:key}, cb);
}

function subscribe(topic, social_account, cb){
	var params = {
	  Protocol: 'application',
	  TopicArn: topic.TopicArn,
	  Endpoint: social_account.deviceId
	};
	return sns.subscribe(params, cb);
}

function publish(topic, subject, message, cb){
	var params = {
		Subject: subject,
		TopicArn: topic.TopicArn,
		Message: message
	};
	return sns.publish(params, cb);
}

function sendNotification(notification, cb){
	this.getTopic(notification.key, function(err, topic){
		if(!err){
			return this.publish(topic, notification.subject, notification.message, cb);
		}else{
			return cb(err);
		}
	})
}

module.exports = {
	getTopic: getTopic,
	subscribe: subscribe,
	publish: publish,
	sendNotification: sendNotification
}