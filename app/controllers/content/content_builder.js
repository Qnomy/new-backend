/**
 * Created by alan on 1/3/16.
 */
var ContentHandler = require('../../models/content');

function buildContent(user, req, res, cb){
    var body = req.body;
    var content = new ContentHandler.ContentModel();
    content.content= body.content;
    content.latitude= body.latitude;
    content.longitude= body.longitude;
    content.user = {
        uid: user.id,
        display_name: user.display_name,
        display_pic: user.display_pic
    }
    cb(null, content);
};

function buildGeoContent(user, content, req, res, cb){
    var content = new ContentHandler.GeoContentModel();
    content.object_id = content.id;
    content.loc= [content.longitude, content.latitude];
    content.user = {
        uid: user.id,
        display_name: user.display_name,
        display_pic: user.display_pic
    }
    cb(null, content);
};

module.exports = {
    buildContent: buildContent,
    buildGeoContent: buildGeoContent
}