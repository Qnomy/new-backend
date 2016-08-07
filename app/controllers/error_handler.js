/**
 * Created by alan on 1/11/16.
 */

var ResponseBuilder = require("./response_builder")
var logger = require('../util/logger');

function handle(res, err){
    // 1. Log the entry into our logger.
    logger.error(err);
    //2. Delete the original error stack trace.
    delete err.original;
    // 3. Return the information to the user.
    ResponseBuilder.sendResponse(res, 500, err);
    //res.status(err.http_status).json(err);
}

module.exports = {
    handle: handle
};