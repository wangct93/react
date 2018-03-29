/**
 * Created by Administrator on 2018/3/20.
 */


let mysql = require('../../modules/mysql');



module.exports = {
    getList,
    getInfo,
    getListAndTotal,
    getTotal
};


function getList(params,cb,eb){
    let {start,limit,keyword,sortField,sortDesc,num = 1,size = 10} = params;
    limit = limit || size;
    start = start ? start.toNum() : (num - 1) * limit;
    mysql.query(`select id,name,author,content,fmImg,sourceType blogType,source,"blog" sourceType,date_format(createTime,"%Y-%m-%d %H:%i:%s") time from blog ${keyword ? `where name like '%${keyword}%'` : ''} ${sortField ? `order by ${sortField} ${sortDesc ? 'desc' : ''}` : ''} limit ${start},${limit}`,cb,eb);
}

function getListAndTotal(params,cb,eb){
    let listPro = new Promise((cb,eb) => {
        getList(params,cb,eb);
    });
    let totalPro = new Promise((cb,eb) => {
        getTotal(params,cb,eb);
    });
    Promise.all([listPro,totalPro]).then((result) => {
        cb({
            total:result[1][0].total,
            list:result[0]
        })
    },eb);
}

function getTotal(params,cb,eb){
    let {keyword} = params;
    mysql.query(`select count(id) total from blog ${keyword ? `where name like '%${keyword}%'` : ''}`,cb,eb);
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