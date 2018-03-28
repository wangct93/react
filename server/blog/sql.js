/**
 * Created by Administrator on 2018/1/22.
 */
var mysql = require('../../modules/mysql');
var wt = require('../../modules/util');
var sqlList = {
    getStoryListTotal:getStoryListTotal,
    getStoryList:getStoryList,
    insertStory:insertStory,
    getNovelList:getNovelList,
    getNovelListTotal:getNovelListTotal,
    getNovelInfo:getNovelInfo,
    getChapterList:getChapterList,
    getChapterInfo:getChapterInfo,
    getChapterIdByIndex:getChapterIdByIndex,
    getWorksList:getWorksList,
    getWorksListTotal:getWorksListTotal
};

module.exports = sqlList;

/**
 * 插入文章
 * @param data
 * @param cb
 * @param eb
 */
function insertStory(data,cb,eb){
    if(!wt.isArray(data)){
        data = [data];
    }
    var temp = [];
    data.forEach(function(data){
        temp.push('("'+ data.title +'","'+ data.content +'","'+ data.fmimg +'","0","'+ data.author +'","'+ new Date().toFormatString('YYYY-MM-DD hh:mm:ss') +'")');
    });
    var sql = 'insert into story (title,content,fmimg,browse_hits,author,time) values' + temp.join(',');
    mysql.query(sql,cb,eb);
}

/**
 * 获取文章列表
 * @param data
 * @param cb
 * @param eb
 */
function getStoryList(data,cb,eb){
    var default_data = {
        sortType:'time',
        sortDesc:false,
        start:0,
        limit:10
    };
    data = wt.extend(default_data,data);
    var sql = 'select id,content,title,author,date_format(time,"%Y-%m-%d %H:%i:%s") time,browse_hits,fmimg from story';
    if(data.keyword){
        sql += ' where title like "%'+ data.keyword +'%" or author like "%'+ data.keyword +'%" or content like "%'+ data.keyword +'%" ';
    }
    sql += ' order by ' + data.sortType;
    if(data.sortDesc){
        sql += ' desc';
    }
    sql += ' limit ' + data.start + ',' + data.limit;
    mysql.query(sql,cb,eb);
}

/**
 * 获取文章总数
 * @param data
 * @param cb
 * @param eb
 */
function getStoryListTotal(data,cb,eb){
    var default_data = {
        sortType:'time',
        sortDesc:true,
        start:0,
        limit:10
    };
    data = wt.extend(default_data,data);
    var sql = 'select count(id) total from story';
    if(data.keyword){
        sql += ' where title like "%'+ data.keyword +'%" or author like "%'+ data.keyword +'%" or content like "%'+ data.keyword +'%" ';
    }
    mysql.query(sql,cb,eb);
}

/**
 * 获取小说列表
 * @param data
 * @param cb
 * @param eb
 */
function getNovelList(data,cb,eb){
    var defaultData = {
        start:0,
        limit:10
    };
    data = wt.extend(defaultData,data);
    var sql = 'select id,name,author,time,intro,type,state,fmImg,clickhits clicks,zanhits zans from book';
    if(data.keyword){
        sql += ' where name like "%'+ data.keyword +'%"';
    }
    sql += ' limit '+ data.start +',' + data.limit;
    mysql.query(sql,cb,eb);
}


/**
 * 获取文章总数
 * @param data
 * @param cb
 * @param eb
 */
function getNovelListTotal(data,cb,eb){
    var sql = 'select count(id) total from book';
    if(data.keyword){
        sql += ' where name like "%'+ data.keyword +'%"';
    }
    mysql.query(sql,cb,eb);
}

/**
 * 获取小说信息
 * @param id
 * @param cb
 * @param eb
 */
function getNovelInfo(id,cb,eb){
    mysql.query('select * from book where id = ' + id,cb,eb);
}

/**
 * 获取小说章节列表
 * @param id
 * @param cb
 * @param eb
 */
function getChapterList(id,cb,eb){
    mysql.query('select * from chapter where bookId = ' + id,cb,eb);
}

/**
 * 获取章节信息
 * @param id
 * @param cb
 * @param eb
 */
function getChapterInfo(id,cb,eb){
    mysql.query('select b.name bookName,b.author author,c.url url,c.name name,c.time time,c.chapterIndex chapterIndex,b.id bid from chapter c,book b where c.id = ' + id + ' and c.bookId=b.id',cb,eb);
}

/**
 * 获取章节信息
 * @param id
 * @param cb
 * @param eb
 */
function getChapterIdByIndex(bid,chapterIndex,cb,eb){
    mysql.query('select id from chapter where bookid = ' + bid + ' and chapterIndex=' + chapterIndex,cb,eb);
}


/**
 * 获取小说列表
 * @param data
 * @param cb
 * @param eb
 */
function getWorksList(data,cb,eb){
    var defaultData = {
        start:0,
        limit:10
    };
    data = wt.extend(defaultData,data);
    var sql = 'select * from works';
    if(data.keyword){
        sql += ' where name like "%'+ data.keyword +'%"';
    }
    sql += ' limit '+ data.start +',' + data.limit;
    mysql.query(sql,cb,eb);
}


/**
 * 获取文章总数
 * @param data
 * @param cb
 * @param eb
 */
function getWorksListTotal(data,cb,eb){
    var sql = 'select count(id) total from works';
    if(data.keyword){
        sql += ' where name like "%'+ data.keyword +'%"';
    }
    mysql.query(sql,cb,eb);
}