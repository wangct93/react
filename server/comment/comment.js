/**
 * Created by Administrator on 2018/3/29.
 */
let mysql = require('../../modules/mysql');


module.exports = {
    getList,
    getTotal,
    getListAndTotal,
    insert
};

function getList(params,cb,eb){
    let {start,limit,num = 1,size = 10,targetId,parentId} = params;
    limit = limit || size;
    start = start ? start.toNum() : (num - 1) * limit;
    mysql.query(`select id,username,content,date_format(time,"%Y-%m-%d %H:%i:%s") time,to_userid toUserId,to_username toUserName,parentId,targetId from comment where ${parentId ? `parentId = ${parentId}` : 'parentId is null'} ${targetId ? `and targetId = '${targetId}'` : ''} order by time limit ${start},${limit}`,cb,eb);
}
function getTotal(params,cb,eb){
    let {targetId,parentId} = params;
    mysql.query(`select count(id) total from comment where ${parentId ? `parentId = ${parentId}` : 'parentId is null'} ${targetId ? `and targetId = '${targetId}'` : ''}`,cb,eb);
}
function getListAndTotal(params,cb,eb){
    let tp = new Promise((cb,eb) => {
        getTotal(params,cb,eb);
    });
    let lp = new Promise((cb,eb) => {
        getList(params,cb,eb);
    });
    Promise.all([tp,lp]).then((result) => {
        cb({
            total:result[0][0].total,
            list:result[1]
        });
    },eb);

}


function insert(params,cb,eb){
    let {targetId,parentId,userId = 1,username = 'wangct',content,toUserId,toUserName} = params;
    mysql.query(`insert into comment set ?`,{
        username,
        content,
        time:new Date().toFormatString(),
        parentId,
        targetId,
        to_userId:toUserId,
        to_userName:toUserName
    },cb,eb);
}