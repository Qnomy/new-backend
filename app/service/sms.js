/**
 * Created by alan on 1/11/16.
 */

var config = require("../config/config");
var twilio = require("twilio");
var request = require("superagent");

var client = twilio(config.sms.twilio.accountSid, config.sms.twilio.authToken);
/**********************************************************************************************************************/
/*                                                        TWILIO                                                      */
/**********************************************************************************************************************/
function twilioSendMessage(req, res, phoneNumberTo, body, cb){
    var message = {
        to: phoneNumberTo,
        from: config.sms.twilio.from,
        body: body
    };
    client.sendMessage(message, function (err, data){
        if (err){
            res.status(500).json({server:config.service_friendly_name, http_status:500, status:{ message: "There was a problem trying to send you an sms, please try again later." }});
            res.end();
            return;
        }
        cb(data);
    });
};

function twilioVerifyNumber(req, res, phoneNumberTo, cb){
    cb();
}

/**********************************************************************************************************************/
/*                                                        NEXTMO                                                      */
/**********************************************************************************************************************/

function nextmoSendMessage(req, res, phoneNumberTo, body, cb){
    request
        .get(config.sms.nexmo.url)
        .query({api_key: config.sms.nexmo.appKey})
        .query({api_secret: config.sms.nexmo.appSecret})
        .query({from: "BubbleYou"})
        .query({to: phoneNumberTo})
        .query({text: body})
        .end(function(err, nextmoResponse){
            if (err){
                err = {server: config.service_friendly_name, http_status: 500, status: {message: "There was a problem sending you an sms, please try again later.", original: err}};
                cb(err, nextmoResponse);
                return;
            }
            if (nextmoResponse.body.messages[0].status != "0"){
                err = {server: config.service_friendly_name, http_status: 500, status: {message: "There was a problem sending you an sms, please try again later."}};
                cb(err, nextmoResponse);
                return;
            }
            cb(err, nextmoResponse);
        });
};

function nextmoVerifyNumber(req, res, phoneNumberTo, cb){
    request
        .get(config.sms.nexmo.url_verify)
        .query({api_key: config.sms.nexmo.appKey})
        .query({api_secret: config.sms.nexmo.appSecret})
        .query({number: phoneNumberTo})
        .query({brand: "NexmoVerifyTest"})
        .end(function(err, verify){
            cb(err, verify);
        });
}

module.exports = {
    sendMessage: nextmoSendMessage,
    verifyNumber: nextmoVerifyNumber
}