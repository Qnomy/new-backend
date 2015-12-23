/**
 * Created by alan on 12/18/15.
 */
var config = require('./config');
var os = require("os");
var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    client = new kafka.Client(config.kafka.zk, config.kafka.clientId, config.kafka.zkOptions),
    producer = new Producer(client);

config.status.kafka_alive = false;

producer.on("ready", function (){
    config.status.kafka_alive = true;
    producer.send([{topic: config.kafka.topics.service_status_topic, messages: JSON.stringify(config)}], function (err, data){});
    console.log("Connection established to Kafka");
});

producer.on("error", function (err){
    config.status.kafka_alive = false;
});

module.exports = producer;
