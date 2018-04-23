/**
 * Created by Administrator on 2018/4/19.
 */

const express = require('express');
const router = express.Router();
const request = require('request');
const path = require('path');
const fs = require('fs');
const sendError = require('./sendError');
const wt = require('../modules/util');
const cloud = require('../modules/cloud');
const formidable = require('formidable');
const iconv = require('iconv-lite');
const mime = require('mime');
const config = require('../modules/config');
const cloudConfig = config.cloud;

module.exports = router;

/**
 * 解决浏览器跨域加载数据
 */
router.get('/loadRemote',(req,res) => {
    let {url,params,method = 'get',charset = 'utf-8'} = req.query;
    params = typeof params === 'string' ? JSON.parse(params) : params;
    request({
        url,
        method,
        form:params
    }).pipe(iconv.decodeStream(charset)).collect((err,data) => {
        if(err){
            console.log(err);
            sendError(res,err);
        }else{
            res.send(data);
        }
    });
});

/**
 * 解决浏览器跨域加载数据
 */
router.post('/imageOCR',(req,res) => {
    let {headers} = req;
    let contentType = headers['content-type'].split(';')[0];
    let {AppId,wxBucket,SecretID} = cloudConfig;
    let authorization = `a=${AppId}&b=${wxBucket}&k=${SecretID}&e=0&t=[currentTime]&r=${+new Date()}&u=0&f=123`;

    if(contentType === 'multipart/form-data'){
        let form = formidable.IncomingForm();
        form.uploadDir = path.resolve(__dirname,'../temp');
        form.parse(req,(err,fields,files) => {

        });
    }else{
        let {url} = req.body;

        request({
            url:'http://recognition.image.myqcloud.com/ocr/general',
            method:'post',
            headers:{

            },
            form:{
                appid:AppId,
                bucket:wxBucket,
                url
            }
        },(err,qres,data) => {

        });
    }
});

/**
 * 下载本地或远程文件
 */
router.get('/downloadFile',(req,res) => {
    let {query} = req;
    let filePath = query.path;
    let fileName = path.basename(filePath);
    if(/^http/.test(filePath)){
        let fileType = mime.lookup(filePath);
        res.header('content-type',fileType);
        res.header('Content-Disposition','attachment;filename=' + fileName);
        request(filePath).pipe(res);
    }else{
        res.download(filePath,fileName);
    }
});

/**
 * 上传文件到云端
 */
router.post('/uploadFileToCloud',(req,res) => {
    let form = formidable.IncomingForm();
    form.uploadDir = path.resolve(__dirname,'../temp');
    form.parse(req,(err,fields,files) => {
        let list = [];
        for(let field in files){
            if(files.hasOwnProperty(field)){
                files[field].field = field;
                list.push(files[field]);
            }
        }
        let queue = new wt.Queue({
            list,
            execFunc:uploadFile,
            success(result){
                res.send(result);
            }
        });
        queue.start();
    });
});


const uploadFile = (file,cb) => {
    let a = +new Date();
    let {size,name,field} = file;
    let Key = name + +new Date();
    fs.readFile(file.path,(err,data) => {
        if(err){
            console.log(err);
            cb('error');
        }else{
            let addrPromise = new Promise((cb,eb) => {
                cloud.getFileAddr({
                    Key
                },(err,data) => {
                    if(err){
                        console.log(err);
                        eb(err);
                    }else{
                        cb(data);
                    }
                });
            });
            let uploadPromise = new Promise((cb,eb) => {
                cloud.uploadFile({
                    Key,
                    Body:data,
                    ContentLength:size
                },(err,data) => {
                    if(err){
                        console.log(err);
                        eb(err);
                    }else{
                        cb(data);
                    }
                });
            });
            Promise.all([addrPromise,uploadPromise]).then((result) => {
                cb({
                    field,
                    url:result[0]
                });
                console.log(+new Date() - a);
            },err => {
                cb('error');
            });
        }
    });
};