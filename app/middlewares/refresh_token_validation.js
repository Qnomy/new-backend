/**
 * Created by alan on 12/20/15.
 */
var Validator = require('jsonschema').Validator;
var v = new Validator();

var schema = {
    "id": "TokenRefreshSchema",
    "type": "object",
    "properties": {
        "token": {"type": "string"},
        "token_refresh": {"type": "string"}
    },
    "required": ["token", "token_refresh"]
};

module.exports.validate_schema = function(req, res, next){
    console.log(req.body);
    console.log(schema);
    if (!v.validate(req.body, schema)){
        console.log("The token refresh schema is not valid");
        res.status(400).json({server:"scarlett", http_status:500, status:{ message: "The schema is not valid" }});
    } else {
        console.log("The token refresh schema is valid");
        next();
    }
};

module.exports.validate_user_existance_by_token = function(req, res, next){
    //TODO: Implement facebook token validation.
    next();
};