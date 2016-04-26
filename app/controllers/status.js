/**
 * Created by alan on 12/18/15.
 */
var express = require('express');
var config = require('../config/config');
var moment = require('moment-timezone');
var router = express.Router();

var sinceTime = moment();

router.get('/', function (req, res){
    var status = {server:"scarlett",version: 1.1, alive: true, since:sinceTime, inner_services: config.status};
    console.log("status called.");
    res.json(status);
});

module.exports = router;

