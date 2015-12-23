/**
 * Created by alan on 12/17/15.
 */
'use strict';
var os = require('os');
module.exports = {
    tokenValidTime: 600000, // token expiration every 10 minutes.
    pid: os.pid,
    hostname: os.hostname,
    service: "auth-service",
    db: 'mongodb://ec2-52-19-217-56.eu-west-1.compute.amazonaws.com:27017/user_db',
    kafka: {
        zk: "stg-kafka.bubbleyou.com:2181",
        clientId: "auth-service",
        zkOptions: {
            sessionTimeout: 30000,
            spinDelay : 2000,
            retries : 3
        },
        topics: {
            service_status_topic: "service_status",
            user_login_topic: "user_login"
        }
    },
    status: {}
};