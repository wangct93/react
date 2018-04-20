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

module.exports = router;

/**
 * 解决浏览器跨域加载数据
 */
router.get('/loadRemoteAdrr',(req,res) => {
    let {url,params,method = 'get'} = req.query;
    params = typeof params === 'string' ? JSON.parse(params) : params;
    request({
        url,
        method,
        form:params
    },(err,qres,data) => {
        if(err){
            console.log(err);
            sendError(res,err);
        }else{
            res.send(data);
        }
    });
});

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