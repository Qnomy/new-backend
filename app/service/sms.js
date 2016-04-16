/**
 * Created by alan on 1/11/16.
 */

var config = require("../config/config");
var twilio = require("twilio");
var request = require("superagent");

var client = twilio(config.sms.twilio.accountSid, config.sms.twilio.authToken);
var nexmo = require('easynexmo');
nexmo.initialize(config.sms.nexmo.appKey, config.sms.nexmo.appSecret, true);

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


/**
 * Talks to nextmo and sends a verification message, it returns a request id.
 * @param req
 * @param res
 * @param phoneNumberTo
 * @param body
 * @param cb
 */
function verifyNumber(req, res, phoneNumberTo, cb){
    nexmo.verifyNumber({number:phoneNumberTo, brand:"Foam"},function (err,response) {
        cb(err, response);
    });
};

function verifyCode(req, res, code, request_id, cb){
    nexmo.checkVerifyRequest({request_id:request_id, code: code},function(err, message){
        cb(err, message);
    });
}

module.exports = {
    verifyNumber: verifyNumber,
    verifyCode: verifyCode
}