/**
 * Created by alan on 12/17/15.
 */

var usersController = require('../controllers/users');
var statusController = require('../controllers/status');

module.exports = function (app) {
    app.use('',statusController);
    app.use('/auth/v1',usersController);
};