/**
 * Created by Administrator on 2017/12/13.
 */


var mysql = require('../../modules/mysql');
var wt = require('../../modules/util');
var fs = require('fs');


module.exports = {
    insertBooks:insertBooks,
    insertChapters:insertChapters
};



function insertBooks(books,cb,eb){
    if(!wt.isArray(books)){
        books = [books];
    }
    var temp = [];
    var time = new Date().toFormatString();
    books.forEach(function(book){
        errFilter(book);
        temp.push('("'+ book.name +'","'+ book.author +'","'+ book.type +'","'+ book.intro +'","'+ book.fmImg +'","'+ time +'",'+ book.state +')');
    });
    var sql = 'insert into book(name,author,type,intro,fmImg,time,state) values' + temp.join(',');
    mysql.query(sql,cb,eb);
}


function insertChapters(chapters,cb,eb){
    if(!wt.isArray(chapters)){
        chapters = [chapters];
    }
    var temp = [];
    var time = new Date().toFormatString();
    chapters.forEach(function(chapter){
        errFilter(chapter);
        temp.push('("'+ chapter.name +'","'+ chapter.url +'","'+ chapter.bookId +'","'+ time +'",'+ chapter.index +')');
    });
    var sql = 'insert into chapter(name,url,bookId,time,chapterIndex) values' + temp.join(',');
    mysql.query(sql,cb,eb);
}


function errFilter(data){
    for(var name in data){
        if(data.hasOwnProperty(name) && wt.isString(data[name])){
            data[name] = data[name].replace(/"/g,'“');
        }
    }
}