/**
 * Created by Administrator on 2018/4/12.
 */


const wt = require('util');
const crypto = require('crypto');
const request = require('request');

const config = require('../modules/config');
const cloudConfig = config.cloud;
let {AppId,wxBucket,SecretId,SecretKey} = cloudConfig;
let authorization = `a=${AppId}&b=${wxBucket}&k=${SecretId}&e=0&t=${+new Date()}&r=${+new Date()}&u=0&f=123`;

const hmac = crypto.createHmac('sha1',SecretKey);
hmac.update(authorization);
authorization = hmac.digest().toString('base64');
console.log(authorization);
let data = {
    appid:AppId,
    bucket:wxBucket,
    url:'https://ss3.baidu.com/-rVXeDTa2gU2pMbgoY3K/it/u=94176867,3139555548&fm=202&mola=new&crop=v1'
};
// request({
//     url:'http://recognition.image.myqcloud.com/ocr/general',
//     method:'post',
//     headers:{
//         host:'recognition.image.myqcloud.com',
//         'content-type':'application/json',
//         'content-length':JSON.stringify(data).length,
//         authorization
//     },
//     form:data
// },(err,qres,data) => {
//     console.log(err);
//     console.log(data);
// });