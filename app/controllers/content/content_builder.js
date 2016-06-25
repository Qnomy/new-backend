/**
 * Created by alan on 1/3/16.
 */
var ContentHandler = require('../../models/content');


/**
 * This collection is kept forever and partitionated by country (Ideally and not implemented yet).
 * @param user
 * @param req
 * @param res
 * @param cb
 */
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

/**
 * This collection actually only lasts for 15 minutes.
 * @param user
 * @param content
 * @param req
 * @param res
 * @param cb
 */
function buildGeoContent(user, content, req, res, cb){
    var geoContent = new ContentHandler.GeoContentModel();
    geoContent.object_id = content.id;
    geoContent.loc= [content.longitude, content.latitude];
    geoContent.user = {
        uid: user.id,
        display_name: user.display_name,
        display_pic: user.display_pic
    }
    cb(null, geoContent);
};

module.exports = {
    buildContent: buildContent,
    buildGeoContent: buildGeoContent
}