/**
 * Created by alan on 12/20/15.
 */
var fs = require('fs');
var path = require('path');

module.exports = function(app){
    var modelsPath = path.join(__dirname,"../models/");
    fs.readdirSync(modelsPath).forEach(function(file){
        var fileToRequired = '../models/'+ file.split("\.")[0];
        console.log("Requiring model: " + fileToRequired)
        require(fileToRequired);
    });
}