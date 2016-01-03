/**
 * Created by alan on 12/17/15.
 */
'use strict';
var os = require('os');
var process = require('process');

var lookup = function(variable, envValue, defaultValue){
    if (envValue){
        console.log("Configuring variable: " + variable + " taken from environment with value: " + envValue);
        defaultValue = envValue;
    } else {
        console.log("Configuring variable: " + variable + " taken from default value: " + defaultValue);
    };
    return defaultValue;
}

module.exports = {
    tokenValidTime: 600000, // token expiration every 10 minutes.
    pid: os.pid,
    hostname: os.hostname,
    service: "auth-service",
    db: lookup('mongo_db', process.env.MONGO_DB, 'mongodb://ec2-52-19-217-56.eu-west-1.compute.amazonaws.com:27017/user_db'),
    kafka: {
        zk: lookup('zk', process.env.ZK, 'stg-kafka.bubbleyou.com:2181'),
        clientId: lookup('client_id', process.env.CLIENT_ID, 'auth-service'),
        zkOptions: {
            sessionTimeout: lookup('kafka.session_timeout', process.env.ZK_SESSION_TIMEOUT, 30000),
            spinDelay : lookup('kafka.spin_delay', process.env.ZK_SPIN_DELAY, 2000) ,
            retries : lookup('kafka.retry', process.env.ZK_RETRY, 3)
        },
        topics: {
            service_status_topic: lookup('kafka.topic.status', process.env.KAFKA_STATUS_TOPIC, "service_status"),
            user_login_topic: lookup('kafka.topic.login', process.env.KAFKA_LOGIN_TOPIC, "user_login")
        }
    },
    status: {},
    rest_api: {
        social_validation_url: {
            facebook: "https://graph.facebook.com/me",
            twitter: "https://api.twitter.com/1.1/users/show.json",
            instagram: "https://graph.facebook.com/me"
        },
        default_config: {
            requestConfig:{
                timeout:2000, //request timeout in milliseconds
                noDelay:true, //Enable/disable the Nagle algorithm
                keepAlive:true, //Enable/disable keep-alive functionalityidle socket.
                keepAliveDelay:1000 //and optionally set the initial delay before the first keepalive probe is sent
            },
            responseConfig:{
                timeout:2000 //response timeout
            }
        }
    }


};