/**
 * Created by Administrator on 2017/5/10.
 */

var mysql = require('mysql');
var wt = require('./util');
var config = require('./config').mysql;

function exec(query,data,cb,eb){
    var row = null;
    var success,error;
    if(wt.isFunction(data)){
        success = data;
        error = cb;
    }else{
        row = data;
        success = cb;
        error = eb;
    }
    var database = mysql.createConnection(config);
    database.connect();
    console.log('执行sql语句：' + query);
    database.query(query,row,function(err,rows){
        if(err){
            console.log(err.message);
            wt.execFunc(error,err);
        }else{
            wt.execFunc(success,rows);
        }
    });
    database.end();
}

function setConfig(option){
    wt.extend(config,option);
}




module.exports = {
    query:exec,
    setConfig:setConfig
};
