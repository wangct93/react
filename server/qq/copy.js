/**
 * Created by Administrator on 2018/4/13.
 */

const request = require('request');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const url = require('url');

const wt = require('../../modules/util');

const remotes = {
    list:{
        remoteAddr:'https://h5.qzone.qq.com/proxy/domain/b.qzone.qq.com/cgi-bin/blognew/get_abs',
        formDataFields:['hostUin','uin','blogType','reqInfo','pos','num','sortType','source','g_tk','outCharset','qzonetoken'],
        cookieFields:['p_uin','p_skey']
    },
    detail:{
        remoteAddr:'https://h5.qzone.qq.com/proxy/domain/b.qzone.qq.com/cgi-bin/blognew/blog_output_data',
        formDataFields:['uin','blogid','outCharset'],
        cookieFields:['skey','p_uin'],
        headers:{
            referer:'https://qzs.qq.com/qzone/app/blog/v6/bloglist.html',
        }
    }
};

const User = {
    p_uin:'o0975840786',
    skey:'@VGpklPYlg',
    p_skey:'RYS7NRwIbjhJHTcnNKJarDcFCUqzceYgR4b9CAoY*Zk_',
    hostUin:'975840786',
    uin:'975840786',
    blogType:'0',
    reqInfo:'1',
    pos:'0',
    num:'15',
    sortType:'0',
    source:'0',
    g_tk:'444625742',
    outCharset:'utf-8',
    qzonetoken:'664b9810d6e91f3f0fdf1819d02426c8e7b51af52eb2a64b3d508ac1d67a322537f12f625db554f3',
    blogid:'1511747679'
};


let QQ = {
    getLogListAndTotal(cb,eb){
        let data = User;
        let {remoteAddr,headers = {},cookieFields,formDataFields} = remotes.list;
        wt.extend(headers,{
            cookie:getCookie(data,cookieFields)
        });
        let writeStream = fs.createWriteStream(path.resolve(__dirname,'../../temp/getLogListAndTotal.html'));
        request({
            url:url.format({
                pathname:remoteAddr,
                query:getFormData(data,formDataFields)
            }),
            headers
        },(err,res,data) => {
            if(err){
                console.log(err);
                eb();
            }else{
                data = JSON.parse(data.replace(/^[^\{]*|[^\}]*$/g,''));
                let {totalNum,list} = data.data || {};
                cb({
                    total:totalNum,
                    list
                });
            }
        }).pipe(writeStream);
    },
    getLogInfo(id,cb,eb){
        let {remoteAddr,headers = {},cookieFields,formDataFields} = remotes.detail;
        wt.extend(headers,{
            cookie:getCookie(User,cookieFields)
        });
        let writeStream = fs.createWriteStream(path.resolve(__dirname,'../../temp/getLogInfo.html'));
        request({
            url:url.format({
                pathname:remoteAddr,
                query:wt.extend(getFormData(User,formDataFields),{blogid:id})
            }),
            headers
        },(err,res,data) => {
            if(err){
                console.log(err);
                eb();
            }else{
                let $ = cheerio.load(data);
                let blog = JSON.parse($('#topHintArea').next().html().replace(/^[^\{]*|[^\}]*$/g,'')).data;
                blog.content = $('#blogDetailDiv').text().trim();
                cb(blog);
            }
        }).pipe(writeStream);
    }
};

function getCookie(data,cookieFields){
    return cookieFields.map(item => item + '=' + data[item]).join(';');
}
function getFormData(data,formDataFields){
    let obj = {};
    formDataFields.map(item => {
        obj[item] = data[item];
    });
    return obj;
}




QQ.getLogInfo(User.blogid,data => {
    console.log(data);
});