var aws = require("aws-sdk");
var sns = new aws.SNS({apiVersion: '2010-03-31'});
var config = require('../config/config');
var userDevice = require('../models/user_device');
var logger = require('../util/logger');

function createEndpoint(platform, token, cb){
	return cb(null);
	var platformArn = config.SNS.platformARN[platform];
	var params = {
		PlatformApplicationArn: platformARN,
		Token: token
	}
	return sns.createPlatformEndpoint(params, function(err, endpoint){
		if(err){
			logger.error('error while trying to create SNS Endpoint', err);
		}
		cb(err, endpoint);
	});
}

function getTopic(key, cb){
	return cb(null);
	return sns.createTopic({name:key}, function(err, topic){
		if(err){
			logger.error('error while trying to get SNS topic', err);
		}
		cb(err, topic);
	});
}

function subscribe(topic, social_account, cb){
	return cb(null);
	var params = {
	  Protocol: 'application',
	  TopicArn: topic.TopicArn,
	  Endpoint: social_account.deviceId
	};
	return sns.subscribe(params, function(err, subscription){
		if(err){
			logger.error('error while trying to subscribe to SNS topic', err);
		}
		cb(err, topic);
	});
}

function publish(topic, subject, message, cb){
	return cb(null);
	var params = {
		Subject: subject,
		TopicArn: topic.TopicArn,
		Message: message
	};
	return sns.publish(params, function(err, message){
		if(err){
			logger.error('error while trying to publish to SNS topic', err);
		}
		cb(err, message);
	});
}

function sendNotification(notification, cb){
	return cb(null);
	logger.info('sending SNS notification ', notification);
	this.getTopic(notification.key, function(err, topic){
		if(!err){
			return this.publish(topic, notification.subject, notification.message, cb);
		}else{
			logger.error('error while trying to send sns notification', err);
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