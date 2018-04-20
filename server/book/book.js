/**
 * Created by Administrator on 2017/12/14.
 */

const wt = require('../../modules/util');
const mysql = require('../../modules/mysql');
const bqg = require('./biquge');
const ld = require('./lingdian');
module.exports = {
    getListAndTotal,        //获取小说列表
    getBookInfo,        //获取小说信息
    getChapterInfo,   //获取章节信息
    getList
};
function getListAndTotal(params,cb,eb){
    let {keyword} = params;
    let totalPromise = new Promise((cb,eb) => {
        mysql.query(`select count(id) total from book ${keyword ? `where name like "%${keyword}%"` : ''}`,cb,eb);
    });
    let listPromise = new Promise((cb,eb)=>{
        getList(params,cb,eb);
    });
    Promise.all([totalPromise,listPromise]).then((result) => {
        cb({
            total:result[0][0].total,
            list:result[1]
        });
    },eb);
}

function getList(params,cb,eb){
    let {start,limit,keyword,sortField,sortDesc:desc,num = 1,size = 10} = params;
    limit = limit || size;
    start = start ? start.toNum() : (num - 1) * limit;
    mysql.query(`select id,name,author,intro,type,state,fmImg,clickHits,zanHits,date_format(time,"%Y-%m-%d %H:%i:%s") time from book ${keyword ? `where name like "%${keyword}%"` : ''} ${sortField ? `order by ${sortField} ${desc ? 'desc' : ''}` : ''} limit ${start},${limit}`,cb,eb);
}


function getBookInfo(bookId,cb,eb){
    let bookPromise = new Promise((cb,eb) => {
        mysql.query(`select * from book where id = ${bookId}`,(data) =>{
            if(data.length){
                cb(data[0]);
            }else{
                eb('the book is no existed!');
            }
        },eb);
    });
    let chapterPromise = new Promise((cb,eb)=>{
        mysql.query('select * from chapter where bookId = ' + bookId, cb,eb);
    });
    Promise.all([bookPromise,chapterPromise]).then((result) => {
        cb({
            info:result[0],
            list:result[1]
        });
    },eb);
}



function getChapterInfo(chapterId,cb,eb){
    mysql.query('select * from chapter where id=' + chapterId,(rows) => {
        if(rows.length){
            let info = rows[0];
            let {id,url,bookId} = info;
            let p1 = new Promise((cb,eb) => {
                mysql.query('select id,bookId from chapter where id > ' + id + ' limit 1',(rows)=>{
                    let target = rows[0] || {};
                    cb(target.bookId === bookId ? target.id : '');
                },eb);
            });
            let p2 = new Promise((cb,eb) => {
                mysql.query('select id,bookId from chapter where id < ' + id + ' order by id desc limit 1',(rows)=>{
                    let target = rows[0] || {};
                    cb(target.bookId === bookId ? target.id : '');
                },eb);
            });
            let p3 = new Promise((cb,eb) => {
                ld.getText(url,(data) => {
                    cb(data);
                });
            });
            Promise.all([p1,p2,p3]).then((result) => {
                info.nextChapterId = result[0];
                info.prevChapterId = result[1];
                info.text = result[2];
                cb(info);
            },eb);
        }else{
            eb();
        }
    },eb);
}