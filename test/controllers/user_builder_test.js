/**
 * Created by alan on 1/11/16.
 */

var assert = require('assert');
var UserBuilder = require('../../app/controllers/user_builder');

describe("User builder", function (){
    describe("Generate random number", function (){
        it ("should return a 6 digit separated in 2 groups of 3 elements", function (){
            var number = UserBuilder.generateRandomNumber(0,9,6,3);
            assert.equal(number.length, 7);
            assert.equal(number[3], " ");
            var firstElement = number.slice(0,3);
            var secondElement = number.slice(4,7);
            assert.ok(Number(firstElement), "The first element is not a number");
            assert.ok(Number(secondElement), "The second element is not a number");
        });
    });

    describe("Generate tokens", function (){
        it ("should return two tokens based on a user passed by parameter", function (done){
            var user = {uid: 1, role: 1};
            UserBuilder.buildTokens(user, function(err, token){
                assert.ok(token, "The token is empty");
                assert.ok(token.token, "The daily token is empty");
                assert.ok(token.refreshToken, "The token is empty");
                done(err);
            })
        });
    });
});
