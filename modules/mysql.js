/**
 * Created by Administrator on 2017/5/10.
 */

let mysql = require('mysql');
let wt = require('./util');
let config = require('./config').mysql;

function exec(query,data,cb,eb){
    let row = null;
    let success,error;
    if(wt.isFunction(data)){
        success = data;
        error = cb;
    }else{
        row = data;
        success = cb;
        error = eb;
    }
    let database = mysql.createConnection(config);
    database.connect();
    console.log('执行sql语句：' + query);
    database.query(query,row,(err,rows) => {
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
    setConfig
};
