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
    service_friendly_name: "tiger",
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
            user_login_topic: lookup('kafka.topic.login', process.env.KAFKA_LOGIN_TOPIC, "user_login"),
            phone_register_topic: lookup('kafka.topic.phone_register', process.env.KAFKA_PHONE_REGISTER_TOPIC, "phone_register")

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
    },
    reg_code: {
        lenght: 6,
        split:3,
        debug: true
    },
    jwt_token: {
        daily_secret: "5T^k!w&DKbn`:*tc^MEn)*neU73DNC*~$5jE:'8j(eRD",
        refresh_secret: "8KQV3seKYXz*EP$rrh8#bcgvuCAqKA+?Y3fNLKNepYS^%^?y_%!P",
        credential_secret: "}+C@t9'ec-9BG67,^(h)fk5\.uHgNY]6tAUQDX>8",
        options_daily: {expiresIn: "1d", algorithm: "HS512", issuer: "BubbleYou", subject: "auth"},
        options_refresh: {algorithm: "HS512", issuer: "BubbleYou", subject: "auth"},
        options_credential: {expiresIn: "5m", algorithm: "HS512", issuer: "BubbleYou", subject: "auth"},
    },
    sms: {
        twilio: {
            accountSid:'ACb579435228eb11a59f25219efdbe66ae',
            authToken:'9c3b91fbd321150407245d015bc288ba',
            from:'+97233727053'
        },
        nexmo:{
            url_verify: "https://api.nexmo.com/verify/json",
            url: "https://rest.nexmo.com/sms/json",
            appKey: "3169e43a",
            appSecret: "c4c00869"
        }

    },
    tokenType: {
        dailyToken: 1,
        refreshToken: 2,
        credentialToken: 3,
        registerToken: 4,
    },
    corsRequest: ['http://admin.bubbleyou.com', 'https://admin.bubbleyou.com']
};