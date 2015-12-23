/**
 * Created by alan on 12/17/15.
 */
exports.requires_login = function (req, res, next) {
    //if (req.isAuthenticated()) return next();
    //if (req.method == 'GET') req.session.returnTo = req.originalUrl;
    //res.redirect('/login');
    return next();
};