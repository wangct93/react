/**
 * Created by Administrator on 2017/10/19.
 */

var formidable = require('formidable');
var method = require('../modules/method');
var path = require('path');
var fs = require('fs');




module.exports = {
    parseUrl:function(){

    }
}







module.exports = {
    byImg:function(req,res){
        var form = new formidable.IncomingForm();
        form.uploadDir = path.resolve(__dirname,'..','temp');
        form.parse(req,function(err,fields,files){
            if(err){
                console.log(err);
                res.writeHead(200);
                res.end('false');
                return;
            }
            var file = files.file;
            var newPath = path.resolve(file.path,'..',file.name);
            fs.rename(file.path,newPath,function(err){
                if(err){
                    console.log(err);
                    res.end('false');
                    return;
                }
                method.ocrByPath(newPath,function(result){
                    res.writeHead(200);
                    res.end(JSON.stringify(result));
                });
            });

        });
    },
    byUrl:function(req,res){
        var param = req.param;
        var url = param.url;
        method.ocrByPath(url,function(result){
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    }
};