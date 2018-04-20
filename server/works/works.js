/**
 * Created by Administrator on 2018/4/2.
 */

let mysql = require('../../modules/mysql');

module.exports = {
    getListAndTotal,
    getList
};

function getListAndTotal(params,cb,eb){
    let totalPromise = new Promise((cb,eb) => {
        getTotal(params,cb,eb);
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
    mysql.query(`select id,name,intro,fmImg,clickHits,zanHits,date_format(time,"%Y-%m-%d %H:%i:%s") time,url from works ${keyword ? `where name like "%${keyword}%"` : ''} ${sortField ? `order by ${sortField} ${desc ? 'desc' : ''}` : ''} limit ${start},${limit}`,cb,eb);
}

function getTotal(params,cb,eb){
    let {keyword} = params;
    mysql.query(`select count(id) total from works ${keyword ? `where name like "%${keyword}%"` : ''}`,cb,eb);
}