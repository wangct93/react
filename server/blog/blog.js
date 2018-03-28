/**
 * Created by Administrator on 2018/3/20.
 */


let mysql = require('../../modules/mysql');



module.exports = {
    getBlogList,
    getInfo
};


function getBlogList(params,cb,eb){
    let {start = 0,limit = 30} = params;
    mysql.query('select *,"blog" sourceType from blog limit '+ start +',' + limit,cb,eb);
}


function getInfo(id,cb,eb){
    let p1 = new Promise((cb,eb) => {
        mysql.query('select * from blog where id > ' + id + ' limit 1',(rows)=>{
            cb(rows[0] || {});
        },eb);
    });
    let p2 = new Promise((cb,eb) => {
        mysql.query('select * from blog where id < ' + id + ' order by id desc limit 1',(rows)=>{
            cb(rows[0] || {});
        },eb);
    });
    let p3 = new Promise((cb,eb) => {
        mysql.query('select * from blog where id = ' + id,(rows) => {
            cb(rows[0] || {});
        },eb)
    });
    Promise.all([p1,p2,p3]).then((result) => {
        let data = result[2];
        if(data.id){
            data.prev = result[1];
            data.next = result[0];
        }
        cb(data);
    },eb);
}