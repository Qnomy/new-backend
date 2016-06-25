/**
 * Created by alan on 12/17/15.
 */
var bodyParser = require('body-parser'),
    config = require('./config'),
    partialResponse = require('express-partial-response'),
    statusMiddleware = require('../middlewares/status'),
    cors = require('cors');

module.exports = function (app) {
    // Validates that the mongo and kafka connection are alive.
    app.use(statusMiddleware.validate_inner_services);

    // Using content type json back and forth.
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // add fields expansion.
    app.use(partialResponse({
        query: 'filter'
    }));

    var whitelist = config.corsRequest;
    var corsOptions = {
        origin: function(origin, callback){
            var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
            callback(null, originIsWhitelisted);
        }
    };

    app.use(cors(corsOptions));

};

