/**
 * Created by Administrator on 2017/12/29.
 */



var mysql = require('../../modules/mysql');
var wt = require('../../modules/util');
var fs = require('fs');
var path = require('path');
var tempPath = path.resolve(__dirname,'temp/num.txt');


var insertQueue = new wt.Queue({
    execFunc:function(data,cb){
        var a = +new Date();
        var name = data.name;
        var keywordTemp = [];
        name.split(/\s+/).forEach(function(item){
            item.getKeywords(0,keywordTemp);
        });
        mysql.query('insert into t(name,remoteAddr,keywords) values("'+ name +'","'+ row.linkId +'","'+ keywordTemp.join(' ') +'")',function(){
            var num = data.id;
            console.log('插入成功：' + num + '，用时：' + (+new Date() - a));
            fs.writeFile(tempPath,num);
            cb();
        });
    }
});


function start(){
    fs.readFile(tempPath,function(err,data){
        if(err){
            console.log(err.message);
        }else{
            var num = parseInt(data.toString());
            var queue = new wt.Queue({
                getItem:function(){
                    return num;
                },
                next:function(){
                    num++;
                },
                execFunc:function(n,cb){
                    var a = +new Date();
                    mysql.query('select id,name,url from cl where id = ' + n ,function(data){
                        if(data.length){
                            console.log('id：' + data[0].id + '，用时：' + (+new Date() - a));
                            insertQueue.list.push(data[0]);
                            insertQueue.start();
                            cb();
                        }else{
                            cb();
                        }
                    },cb);
                },
                limit:1
            });
            queue.start();
        }
    })
}