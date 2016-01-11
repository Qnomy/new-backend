/**
 * Created by alan on 1/11/16.
 */
var assert = require('assert');
var SmsService = require('../../app/service/sms');

function mockResponse(){
    return {
        status: function (code){
            console.log(code);
            return {
                json: function (json){
                    console.log(json);
                }
            }
        }
    }
}

describe("SMS Module", function(){
    describe("Verify phone number", function(){
        it("Should be valid if phone number is: +972528812829", function(done){
            var response = mockResponse();
            SmsService.verifyNumber(null, response, "+972528812829",function (){
                done();
            });

        })
    })

    describe("Send an sms", function(){
        it("Should receive an sms to: +972528812829", function(done){
            var response = mockResponse();
            SmsService.sendMessage(null, response, "+972528812829","765 432",function (){
                done();
            });

        })
    })
})