/**
 * Created by Administrator on 2017/12/6.
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const url = require('url');
const request = require('request');

const queryString = require('queryString');
const crypto = require('crypto');
const wt = require('./lib/util/util');
const config = require('./config');
const cloud = require('./cloud');


const formidable = require('formidable');
const form = new formidable.IncomingForm();
form.uploadDir = path.resolve(__dirname,'../temp');


/**
 * formData 后台发起上传文件
 * @param data
 * @returns {Buffer}
 */
function formdata(data){
    let boundary = '-------------wangchuitong' + (+new Date());
    opt.headers['content-type'] += ';boundary=' + boundary;
    let b = new Buffer(0);
    let name,value,fileName;
    let fileNames = opt.fileNames;
    let fileText = '';
    for(name in data){
        if(data.hasOwnProperty(name)){
            value = data[name];
            if(Buffer.isBuffer(value)){
                fileName = fileNames[name] || '1.png';
                fileText = ';filename="'+ fileName +'"\r\nContent-Type: application/octet-stream';
                value = data[name];
            }else{
                value = new Buffer(data[name].toString());
            }
            b = Buffer.concat([b,new Buffer('--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="'+ name + fileText +'"\r\n\r\n'),value,new Buffer('\r\n')]);
        }
    }
    b = Buffer.concat([b,new Buffer('--' + boundary + '--\r\n')]);
    return b;
}





function toBase64(pathname,cb){
    // var pathname = url.parse(remoteAddr).pathname;
    let re = /^(http[s]?):/;
    let match = pathname.match(re);
    if(match){
        request(pathname,function(err,req,data){
            if(err){
                console.log(err);
                cb('');
            }else{
                cb('data:' + mime.lookup(path.extname(pathname) || '.png') + ';base64,' + data.toString('base64'));
            }
        });
    }else{
        fs.readFile(pathname,function(err,data){
            if(err){
                console.log(err);
                cb('');
            }else{
                cb('data:' + mime.lookup(path.extname(pathname) || '.png') + ';base64,' + data.toString('base64'));
            }
        });
    }
}

function ocr(base64,cb){
    request.post({
        url:'http://ai.baidu.com/aidemo',
        headers:{
            'content-type':'application/x-www-form-urlencoded;',
            cookie:'BAIDUID=B7F9168318AF24C381A909D227A7E3EC'
        },
        form:{
            type:'commontext',
            image:encodeURIComponent(base64)
        }
    },(err,req,data) => {
        if(err){
            console.log(err);
            cb('');
        }else{
            cb(JSON.parse(data.toString()));
        }
    })
}

function ocrByPath(filePath,cb){
    toBase64(filePath,function(base64){
        ocr(base64,cb);
    });
}


function getLocalIp(){
    let interfaces = require('os').networkInterfaces();
    for(let devName in interfaces){
        let iface = interfaces[devName];
        for(let i = 0;i < iface.length;i++){
            let alias = iface[i];
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                return alias.address;
            }
        }
    }
}

function getClientIp(req){
    let ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    return ip.replace(/[\s\S]*:/g,'');
}


function upload(req,cb){
    form.parse(req,cb);
}

function uploadFile(req,cb,eb){
    form.parse(req,(err,fields,files) => {
        if(err){
            console.log(err);
            eb(err);
        }else{
            let temp = [];
            for(let field in files){
                let file = files[field];
                file.field = field;
                temp.push(file);
            }
            let results = [];
            let queue = new wt.Queue({
                list:temp,
                execFunc:(file,cb) => {
                    let nameTemp = file.name.split('.');
                    let extname;
                    if(nameTemp.length > 1){
                        extname = '.' + nameTemp.pop();
                    }
                    let filename = nameTemp.join('.') + '$_$' + +new Date() + extname;
                    let result = {
                        field:file.field
                    };
                    fs.readFile(file.path,(err,data) => {
                        if(err){
                            console.log(err);
                            eb(err);
                        }else{
                            cloud.uploadFile({
                                Key:filename,
                                Body:data
                            },(err,data) => {
                                if(err){
                                    console.log(err);
                                    eb(err);
                                }else{
                                    result.url = cloud.getFileAddr({
                                        Key:filename
                                    });
                                    results.push(result);
                                    cb();
                                }
                            });
                        }
                    });
                },
                success:() => {
                    cb(results);
                }
            });
            queue.start();
        }
    });
}


function cryptoSha1(str){
    let sha1 = crypto.createHmac('sha1',config.cryPtoKey);
    sha1.update(str.toString());
    return sha1.digest('hex');
}

function getServerAddr(){
    return 'http://' + getLocalIp() + ':' + config.port + '/';
}


function getRemoteAddr(baseRemoteAddr,pathname){
    let re = /^https?:/;
    if(re.test(pathname)){
        return pathname;
    }
    if(!re.test(baseRemoteAddr)){
        baseRemoteAddr = 'http://' + baseRemoteAddr;
    }
    let urlOpt = url.parse(baseRemoteAddr);
    baseRemoteAddr = urlOpt.protocol + '//' + urlOpt.host + (pathname[0] === '/' ? '' : urlOpt.path);
    return path.join(baseRemoteAddr,pathname).replace(/\\/g,'/').replace(/^https?:\/+/,(match) => {
        return match.substr(0,match.length - 1) + '//';
    });
}


let newUtil = {
    request:request,
    toBase64:toBase64,
    ocr:ocr,
    ocrByPath:ocrByPath,        //文字识别
    getLocalIp:getLocalIp,      //获取本地服务器ip地址
    getServerAddr:getServerAddr,
    getClientIp:getClientIp,     //获取客户端ip地址
    uploadFile:uploadFile,       //上传文件
    upload:upload,               //上传文件和数据
    cryptoSha1:cryptoSha1,        //加密
    getRemoteAddr
};

wt.extend(newUtil,wt);
module.exports = newUtil;


/**
 * 控制台颜色
 */
const consoleStyles = {
    'bold'          : ['\x1B[1m',  '\x1B[22m'],
    'italic'        : ['\x1B[3m',  '\x1B[23m'],
    'underline'     : ['\x1B[4m',  '\x1B[24m'],
    'inverse'       : ['\x1B[7m',  '\x1B[27m'],
    'strikethrough' : ['\x1B[9m',  '\x1B[29m'],
    'white'         : ['\x1B[37m', '\x1B[39m'],
    'grey'          : ['\x1B[90m', '\x1B[39m'],
    'black'         : ['\x1B[30m', '\x1B[39m'],
    'blue'          : ['\x1B[34m', '\x1B[39m'],
    'cyan'          : ['\x1B[36m', '\x1B[39m'],
    'green'         : ['\x1B[32m', '\x1B[39m'],
    'magenta'       : ['\x1B[35m', '\x1B[39m'],
    'red'           : ['\x1B[31m', '\x1B[39m'],
    'yellow'        : ['\x1B[33m', '\x1B[39m'],
    'whiteBG'       : ['\x1B[47m', '\x1B[49m'],
    'greyBG'        : ['\x1B[49;5;8m', '\x1B[49m'],
    'blackBG'       : ['\x1B[40m', '\x1B[49m'],
    'blueBG'        : ['\x1B[44m', '\x1B[49m'],
    'cyanBG'        : ['\x1B[46m', '\x1B[49m'],
    'greenBG'       : ['\x1B[42m', '\x1B[49m'],
    'magentaBG'     : ['\x1B[45m', '\x1B[49m'],
    'redBG'         : ['\x1B[41m', '\x1B[49m'],
    'yellowBG'      : ['\x1B[43m', '\x1B[49m']
};