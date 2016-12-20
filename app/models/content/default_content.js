
module.exports.transform = function(source, geoContent, cb){
	return cb(null, geoContent);
}

module.exports.getContentMessage = function(geoContent){return 'not implemented';};
module.exports.getContentImage = function(geoContent){return 'not implemented';};
module.exports.getContentLink = function(geoContent){return 'not implemented';};