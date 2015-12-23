/**
 * Created by alan on 12/18/15.
 */
var express = require('express');
var config = require('../config/config');
var moment = require('moment-timezone');
var router = express.Router();

var sinceTime = moment();

router.get('/simple', function (req, res){
    var status = {server:"scarlett", alive: true, since:sinceTime, inner_services: config.status};
    console.log("status called.");
    res.json(status);
});

module.exports = router;

