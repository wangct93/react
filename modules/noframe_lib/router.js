/**
 * Created by Administrator on 2017/4/25.
 */


var url = require('url');
var querystring = require('querystring');
var path = require('path');
var config = require('./config');
var wt = require('./util');
var stic = require('./static');

function router(req,res){
    addResponseHeaders(res);        //添加配置响应头
    if(checkAllowAddress(req)){
        var urlOpt = url.parse(req.url);
        var pathname = urlOpt.pathname;
        if(stic.check(pathname)){
            stic.exec(req,res);
        }else if(pathname == '/'){
            res.writeHead(302,{
                location:'http://' + wt.getLocalIp() + ':'+ config.port +'/' + config.index
            });
            res.end('');
        }else if(pathname == '/favicon.ico'){
            res.writeHead(200);
            res.end();
        }else{
            execServer(req,res,urlOpt);
        }
    }else{
        res.writeHead(404);
        res.end('无法访问');
    }
}
module.exports = router;

/**
 * 动态执行方法
 * @param req
 * @param res
 * @param urlOpt
 */
function execServer(req,res,urlOpt){
    var pathname = urlOpt.pathname.replace(/^[\/\\]+/,'');
    var pathAry = pathname.split(/\.|!/);
    console.log('the request url is:' + pathname ,' at time:' + new Date().toLocaleString());
    try{
        var modPath = path.resolve(__dirname,'../server',pathAry[0]);
        var mod = require( modPath);
    }catch(e){
        console.log(e.message);
        res.writeHead(404);
        res.end(modPath + ' is 404（not found）');
        return;
    }
    var func = mod[pathAry[1] || 'main'];
    if(wt.isFunction(func)){
        if(req.method == 'GET'){    //对参数进行处理
            req.param = querystring.parse(urlOpt.query);
            func(req,res);
        }else if(req.method == 'POST'){
            //如果是表单文件提交或者请求头中含有passparam属性的，则不进行处理
            if(req.headers['content-type'].split(';')[0] == 'multipart/form-data' || req.headers['passparam']){
                func(req,res);
            }else{
                var buffer = new Buffer(0);
                req.on('data',function(chunk){
                    buffer = Buffer.concat([buffer,chunk]);
                });
                req.on('end',function(){
                    req.param = querystring.parse(buffer.toString());
                    func(req,res);
                });
            }
        }
    }else{
        res.writeHead(404);
        res.end(pathname + ' 404 not found');
    }
}


function addResponseHeaders(res){
    var headers = config.responseHeaders || {};
    for(var name in headers){
        if(headers.hasOwnProperty(name)){
            res.setHeader(name,headers[name]);
        }
    }
}


function checkAllowAddress(req){
    var allowAddress = config.allowAddress;
    if(allowAddress){
        var ip = wt.getClientIp(req);
        return allowAddress == ip || wt.isArray(allowAddress) && allowAddress.indexOf(ip);
    }
    return true;
}