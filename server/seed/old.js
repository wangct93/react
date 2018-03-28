/**
 * Created by Administrator on 2017/12/29.
 */



var mysql = require('../../modules/mysql');
var wt = require('../../modules/util');
var limit = 1000;
var queue = new wt.Queue({
    getItem:function(){
        return 0;
    },
    execFunc:function(n,cb){
        var a = +new Date();
        mysql.query('select id,name,url from chapter limit ' + n + ',' + limit,function(data){
            if(data.length){
                var sqlValues = data.map(function(row){
                    var temp = [];
                    var name = row.name;
                    name.split(/\s+/).forEach(function(item){
                        item.getKeywords(0,temp);
                    });
                    var keywords = temp.join(' ');
                    return '("'+ name +'","'+ row.url +'","'+ keywords +'")' ;
                });
                mysql.query('insert into c(name,remoteAddr,keywords) values' + sqlValues.join(','),function(d){
                    var num = data[data.length - 1].id;
                    console.log('转移成功：' + num);
                    mysql.query('delete from chapter where id <= ' + num,function(data){
                        cb();
                        console.log('用时：' + (+new Date() - a));
                    });
                });
            }
        });
    },
    limit:1
});
queue.start();
