/**
 * Created by Administrator on 2018/3/6.
 */

let wt = require('./lib/util/util');
let config = require('./config').cloud;
let COS = require('cos-nodejs-sdk-v5');


let {AppId,SecretId,SecretKey,Bucket,Region} = config;

let cos = new COS({
    SecretId,
    SecretKey,
    AppId
});
let BucketConfig = {
    Bucket,
    Region
};
wt.extend(exports,{
    getBucket,
    getFileAddr,
    getFile,
    uploadFile
});
/**
 * 获取所有存储区列表
 * @param cb
 */
function getService(cb){
    cos.getService(cb);
}
/**
 * 获取指定存储区的信息
 */
function getBucket(){
    let cosParams = getParams(...arguments);
    cos.getBucket(...cosParams);
}

/**
 * 是否存在指定存储区
 */
function existBucket(){
    let cosParams = getParams(...arguments);
    cos.headBucket(...cosParams);
}
/**
 * 添加一个存储区
 */
function addBucket(){
    let cosParams = getParams(...arguments);
    cos.headBucket(...cosParams);
}
/**
 * 删除一个指定存储区
 */
function deleteBucket(){
    let cosParams = getParams(...arguments);
    cos.deleteBucket(...cosParams);
}
/**
 * 获取当前用户拥有存储区的权限
 */
function getBucketAcl(){
    let cosParams = getParams(...arguments);
    cos.getBucketACL(...cosParams);
}

/**
 * 获取指定存储区指定文件名的地址（有时间限制）
 * @returns {string}
 */
function getFileAddr(params,cb){
    let defaultParams = {
        Expires:60 * 60 * 24 * 365
    };
    params = addBucketParams(wt.extend(defaultParams,params));
    cos.getObjectUrl(params,(err,data) => {
        cb(err,data && data.Url);
    });
}

/**
 * 获取指定文件信息
 */
function getFile(){
    let cosParams = getParams(...arguments);
    cos.getObject(...cosParams);
}

/**
 * 添加文件到指定存储区
 */
function uploadFile(){
    let cosParams = getParams(...arguments);
    cos.putObject(...cosParams);
}


/**
 * 获取通用参数
 * @param params
 * @param cb
 * @param addParams
 * @returns {[*,*]}
 */
function getParams(params,cb,addParams){
    if(wt.isFunction(params)){
        cb = params;
        params = {};
        addParams = cb || {};
    }
    params = wt.extend({},BucketConfig,addParams,params);
    return [params,cb];
}

/**
 * 添加存储区信息
 * @param params
 */
function addBucketParams(params){
    return wt.extend(params,BucketConfig);
}