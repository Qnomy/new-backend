/**
 * Created by alan on 4/19/16.
 */


function save(obj, error_status, error_msg, cb){
    obj.save(function(err){
        if (err){
            res.status(500).json({server:config.service_friendly_name, error_status:500, status:{ message: error_msg }});
            return;
        }
        if (cb){
            cb(content);
        }
    })
}


function getBy(model,criteria,error_status, error_msg, cb){
    model.findOne(criteria, function(err, content){
        if (err){
            res.status(500).json({server:config.service_friendly_name, http_status:error_status, status:{ message: error_msg }});
            return;
        }
        if (cb){
            cb(content);
        }
    })
}

function findBy(model, criteria, error_status, error_msg,cb){
    model.find(criteria, function(err, contents){
        if (err){
            res.status(500).json({server:config.service_friendly_name, http_status:error_status, status:{ message: error_msg }});
            return;
        }
        if (cb){
            cb(contents);
        }
    })
}



module.exports = {
    save: save,
    getBy: getBy,
    findBy: findBy
}