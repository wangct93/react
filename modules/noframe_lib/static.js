/**
 * Created by Administrator on 2016/9/27.
 */
//处理静态资源
var fs = require('fs');
var url = require('url');
var mime = require('mime');
var path = require('path');
var config = require('./config');
var staticName = config.staticName || 'static';

function setStaticName(name){
    staticName = name;
}
function check(pathname){
    return pathname.split(/\/|\\/)[1] === staticName;
}
function exec(req,res){
    var pathname = decodeURIComponent(url.parse(req.url).pathname);
    var filePath = path.resolve(__dirname,'..',pathname.substr(1));
    fs.readFile(filePath,function(err,data){
        if(err){
            res.writeHead(404);
            res.end(err.message);
            console.log(err.message);
        }else{
            res.writeHead(200,{'Content-Type':mime.lookup(path.extname(pathname).substr(1))});
            res.end(data);
        }
    });
}

module.exports = {
    check:check,
    exec:exec,
    setStaticName:setStaticName
};