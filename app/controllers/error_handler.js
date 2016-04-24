/**
 * Created by alan on 1/11/16.
 */
function handle(res, err){
    // 1. Log the entry into our logger.
    // TODO: Finish this.
    //2. Delete the original error stack trace.
    delete err.original;
    // 3. Return the information to the user.
    if (err.http_status){
        res.status(err.http_status).json(err);
    } else {
        res.status(500).json({http_status: 500, message: 'There was a server error, please try again soon.'});
    }
    res.end();
    return;
}

module.exports = {
    handle: handle
};