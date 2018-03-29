/**
 * Created by Administrator on 2018/3/29.
 */
let mysql = require('../../modules/mysql');


module.exports = {
    getList,
    getTotal,
    getListAndTotal
};

function getList(params,cb,eb){
    let {start,limit,num = 1,size = 10,targetId} = params;
    limit = limit || size;
    start = start ? start.toNum() : (num - 1) * limit;
    mysql.query(`select id,username,content,date_format(time,"%Y-%m-%d %H:%i:%s") time,to_userid toUserId,to_username toUserName,parentId from comment ${targetId ? `where targetId = ${targetId}` : ''} limit ${start},${limit}`,cb,eb);
}
function getTotal(params,cb,eb){
    let {targetId} = params;
    mysql.query(`select count(id) total from comment where parentId is null ${targetId ? `and targetId = ${targetId}` : ''} order by time desc`,cb,eb);
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
            list:format(result[1])
        });
    },eb);

}


function format(list){
    let formatData = [];
    let temp = {};
    list.forEach(item => {
        let {parentId} = item;
        if(parentId){
            let parent = temp[parentId] || {};
            let {replyList = []} = parent;
            if(replyList.length === 0){
                parent.replyList = replyList;
            }
            replyList.push(item);
        }else{
            temp[item.id] = item;
            formatData.push(item);
        }
    });
    return formatData;
}