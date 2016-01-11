/**
 * Created by alan on 12/31/15.
 */

var config = require('../config/config');
var jwt = require('jsonwebtoken');

function responsePhoneRegister(req, res, phoneRegister){
    if (config.reg_code.debug){
        console.log("The phone number is: " + phoneRegister.phone_number + " and the code: " + phoneRegister.code);
    }
    res.status(200).json({});
}
/**
 * Response the created user entity to the client.
 * @param req The request object from where we need the information from the request.
 * @param res The response object used to response the information to the client.
 * @param err An error variable to be evaluated to see what to answer to the client.
 * @param user The user we stored previously.
 */
function responseUser(req, res, user, loginType){
    if (err){
        res.status(500).json({server:"scarlett", http_status:500, status:{ message: "There was a problem saving the user, please try again later." }});
    } else {
        if (!user){
            res.status(404).json({server:"scarlett", http_status:404, status:{ message: "The user was not found." }});
        } else {
            res.status(200).json({
                uid: user.id,
                token: user.token,
                token_refresh: user.token_refresh,
                name: user.display_name,
                pic: user.display_pic,
                login_type: loginType
            });
        }
    }
    res.end();
}




/**
 * Response the created user entity to the client.
 * @param req The request object from where we need the information from the request.
 * @param res The response object used to response the information to the client.
 * @param err An error variable to be evaluated to see what to answer to the client.
 * @param user The user we stored previously.
 */
function responseUserToken(req, res, err, user, loginType){
    if (err){
        res.status(500).json({server:"scarlett", http_status:500, status:{ message: "There was a problem saving the user, please try again later." }});
    } else {
        if (!user){
            res.status(404).json({server:"scarlett", http_status:404, status:{ message: "The user was not found." }});
        } else {
            res.status(200).json({
                uid: user.id,
                token: user.token,
                token_refresh: user.token_refresh,
                name: user.display_name,
                pic: user.display_pic,
                login_type: loginType
            });
        }
    }
    res.end();
}

/**
 * Response the created user entity to the client.
 * @param req The request object from where we need the information from the request.
 * @param res The response object used to response the information to the client.
 * @param err An error variable to be evaluated to see what to answer to the client.
 * @param user The user we stored previously.
 */
function responseFullUser(req, res, err, user){
    if (err){
        res.status(500).json({server:"scarlett", http_status:500, status:{ message: "There was a problem saving the user, please try again later." }});
    } else {
        if (!user){
            res.status(404).json({server:"scarlett", http_status:404, status:{ message: "The user was not found." }});
        } else {
            res.status(200).json(user);
        }
    }
    res.end();
    return;
}

module.exports = {
    responseUser: responseUser,
    responseFullUser: responseFullUser,
    responsePhoneRegister: responsePhoneRegister
}