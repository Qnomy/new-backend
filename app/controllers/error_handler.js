/**
 * Created by alan on 1/11/16.
 */

var ResponseBuilder = require("./response_builder")

function handle(res, err){
    // 1. Log the entry into our logger.
    // TODO: Finish this.
    //2. Delete the original error stack trace.
    delete err.original;
    // 3. Return the information to the user.
    if (err.http_status){
        ResponseBuilder.sendResponse(res, err.http_status, err);
        res.status(err.http_status).json(err);
    } else {
        ResponseBuilder.sendResponse(res, 500, {http_status: 500, message: 'There was a server error, please try again soon.'});
    }
}

module.exports = {
    handle: handle
};