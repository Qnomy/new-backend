/**
 * Created by alan on 12/20/15.
 */

var config = require('../config/config');
/**
 * this function actually validates that the kafka and mongo connection are alive.
 */
module.exports.validate_inner_services = function(req,res,next){
    if (!config.status.mongodb_alive){
        res.status(500).json({server:"scarlett", http_status:500, version: 1.1, status: {alive: false, inner_services: config.status}, code: 1});
    } else {
        next();
    }
}
