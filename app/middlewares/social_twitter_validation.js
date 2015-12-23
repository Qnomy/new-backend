/**
 * Created by alan on 12/20/15.
 */
var Validator = require('jsonschema').Validator;
var v = new Validator();

var schema = {
    "id": "/TwitterLogin",
    "type": "object",
    "properties": {
        "social_id": {"type": "string"},
        "token": {"type": "string"},
        "refresh_token": {"type": "string"},
        "expires": {"type": "string"},
        "gender": {"type": "string"},
        "email": {"type": "string"},
        "birthday": {"type": "string"},
        "age_range": {"type": "string"},
        "hometown": {"type": "string"},
        "location": {"type": "string"},
        "timezone": {"type": "string"},
        "display_name": {"type": "string"},
        "display_pic": {"type": "string"}
    },
    "required": ["social_id", "token", "refresh_token","display_name","display_pic"]
};

module.exports.validate_schema = function(req, res, next){
    if (!v.validate(req.body, schema)){
        res.status(400).json({server:"scarlett", http_status:500, status:{ message: "The schema is not valid" }});
    } else {
        next();
    }
};

module.exports.validate_user_existance_by_token = function(req, res, next){
    //TODO: Implement facebook token validation.
    next();
};