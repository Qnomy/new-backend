/**
 * Created by alan on 1/11/16.
 */
function handle(res, err){
    // 1. Log the entry into our logger.
    // TODO: Finish this.
    //2. Delete the original error stack trace.
    delete err.original;
    // 3. Return the information to the user.
    res.status(err.http_status).json(err);
    res.end();
    return;
}

module.exports = {
    handle: handle
};