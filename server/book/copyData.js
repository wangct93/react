/**
 * Created by Administrator on 2017/11/28.
 */



var wt = require('../../modules/util');
var fs = require('fs');
var bqg = require('./biquge');
var ld = require('./lingdian');
var path = require('path');
var mysql = require('./mysql');
var tempFilePath = path.resolve(__dirname,'temp/num.txt');


var imgQueue = new wt.Queue({
    execFunc:function(item,cb){
        wt.request(item.remoteAddr,function(data){
            if(data){
                fs.writeFile(item.localAddr,data,cb);
            }else{
                cb();
            }
        });
    }
});

var sqlQueue = new wt.Queue({
    execFunc:function(books,cb){
        mysql.insertBooks(books,function(data){
            var bookId = data.insertId;
            var chapters = [];
            var imgList = [];
            books.forEach(function(book,i){
                book.list.forEach(function(chapter,index){
                    chapter.bookId = bookId + i;
                    chapter.index = index;
                    chapters.push(chapter);
                });
                imgList.push({
                    remoteAddr:book.fmUrl,
                    localAddr:path.resolve(__dirname,'../..',book.fmImg.substr(1))
                });
            });
            mysql.insertChapters(chapters,function(){
                var num = books.num;
                fs.writeFile(tempFilePath,num + 1);
                console.log('数据加载完成：' + num);
                cb();
            },cb);
            imgQueue.add(imgList);
            imgQueue.start();
        }, cb);
    },
    limit:1
});







function start(){
    fs.exists(tempFilePath,function(bol){
        if(bol){
            fs.readFile(tempFilePath,function(err,data){
                if(err){
                    console.log(err);
                    exec(0);
                }else{
                    var num = parseInt(data.toString());
                    exec(num);
                }
            });
        }else{
            exec(0);
        }
    });
}



var temps = [];
var len = 10;
var saveImgDir = '/static/img/book/';
function exec(num){
    var q = new wt.Queue({
        getItem:function(){
            return num++;
        },
        execFunc:function(n,cb){
            ld.getInfo(n,function(book){
                if(book){
                    book.fmImg = saveImgDir + n + '.png';
                    temps.push(book);
                    if(temps.length >= len){
                        temps.num = n;
                        sqlQueue.add([temps]);
                        sqlQueue.start();
                        temps = [];
                    }
                }
                cb();
            });
        }
    });
    q.start();
}


start();