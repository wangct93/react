/**
 * Created by Administrator on 2018/1/9.
 */

var sql = require('../server/blog/sql');
var path = require('path');
var express = require('express');
var router = express.Router();
var wt = require('../modules/util');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');


module.exports = router;

var Book = require('../server/book/book');
var sendError = require('./sendError');

router.get('/',function(req,res,next){
    res.status(301).setHeader('location','../static/blog_react/index.html');
    res.send();
});
router.get('/home',function(req,res,next){
    res.render('./blog/home');
});
router.get('/about',function(req,res,next){
    res.render('./blog/about');
});
router.get('/contact',function(req,res,next){
    res.render('./blog/contact');
});
router.get('/write',function(req,res,next){
    res.render('./blog/write');
});

router.get('/getStoryList',function(req,res,next){
    var param = req.query;
    var data = {
        start:param.start.toNum(),
        limit:param.limit.toNum(),
        sortType:param.sortType,
        sortDesc:param.sortDesc,
        keyword:param.keyword
    };
    var pt = new Promise(function(cb,eb){
        sql.getStoryListTotal(data,cb,eb);
    });
    var pr = new Promise(function(cb,eb){
        sql.getStoryList(data,cb,eb);
    });
    Promise.all([pt,pr]).then(function(data){
        res.send({
            total:data[0][0].total,
            list:data[1]
        });
    },function(err){
        sendError(res,err);
    });
});

router.post('/insertStory',function(req,res){
    var param = req.body;
    var data = {
        title:param.title,
        content:param.content,
        fmimg:param.fmimg,
        author:'wangct' + +new Date()
    };
    sql.insertStory(data,function(){
        res.send('success');
    },function(err){
        sendError(res,err);
    });
});


router.get('/getStoryList',function(req,res,next){
    var param = req.query;
    var data = {
        start:param.start.toNum(),
        limit:param.limit.toNum(),
        sortType:param.sortType,
        sortDesc:param.sortDesc,
        keyword:param.keyword
    };
    var pt = new Promise(function(cb,eb){
        sql.getStoryListTotal(data,cb,eb);
    });
    var pr = new Promise(function(cb,eb){
        sql.getStoryList(data,cb,eb);
    });
    Promise.all([pt,pr]).then(function(data){
        res.send({
            total:data[0][0].total,
            list:data[1]
        });
    },function(err){
        sendError(res,err);
    });
});


router.get('/getNovelList',function(req,res){
    var param = req.query;
    var data = {
        start:param.start.toNum(),
        limit:param.limit.toNum(),
        keyword:param.keyword
    };
    var pt = new Promise(function(cb,eb){
        sql.getNovelListTotal(data,cb,eb);
    });
    var pr = new Promise(function(cb,eb){
        sql.getNovelList(data,cb,eb);
    });
    Promise.all([pt,pr]).then(function(data){
        res.send({
            total:data[0][0].total,
            list:data[1]
        });
    },function(err){
        sendError(res,err);
    });
});

router.get('/getNovelInfo',function(req,res){
    var param = req.query;
    var id = param.nid;
    sql.getNovelInfo(id,function(data){
        res.send(data[0]);
    },function(err){
        sendError(res,err);
    });
});
router.get('/getChapterList',function(req,res){
    var param = req.query;
    var id = param.nid;
    sql.getChapterList(id,function(data){
        res.send(data);
    },function(err){
        sendError(res,err);
    });
});

router.get('/getChapterInfo',function(req,res){
    var param = req.query;
    var id = param.cid;
    sql.getChapterInfo(id,function(data){
        var info = data[0];
        if(info){
            var textPro = new Promise(function(cb,eb){
                wt.request(info.url,function(data){
                    var html = iconv.decode(data,'gbk');
                    var $ = cheerio.load(html);
                    var $content = $('#articlecontent');
                    cb($content.length ? $content.text() : '');
                });
            });

            var prvChapterIdPro = new Promise(function(cb,eb){
                if(info.chapterIndex){
                    sql.getChapterIdByIndex(info.bid,info.chapterIndex - 1,cb,eb);
                }else{
                    cb([]);
                }
            });
            var nextChapterIdPro = new Promise(function(cb,eb){
                sql.getChapterIdByIndex(info.bid,info.chapterIndex + 1,cb,eb);
            });
            Promise.all([textPro,prvChapterIdPro,nextChapterIdPro]).then(function(result){
                info.text = result[0];
                if(result[1].length){
                    info.prevChId = result[1][0].id;
                }
                if(result[2].length){
                    info.nextChId = result[2][0].id;
                }
                res.send(info);
            },function(err){
                sendError(res,err);
            });
        }else{
            sendError(res,'查询不到数据！');
        }
    },function(err){
        sendError(res,err);
    });
});


router.get('/getTextByOcr',function(req,res){
    var param = req.query;
    var url = param.url;
    wt.ocrByPath(url,function(data){
        res.send(data);
    })
})





router.get('/getWorksList',function(req,res,next){
    var param = req.query;
    var data = {
        start:param.start.toNum(),
        limit:param.limit.toNum(),
        sortType:param.sortType,
        sortDesc:param.sortDesc,
        keyword:param.keyword
    };
    var pt = new Promise(function(cb,eb){
        sql.getWorksListTotal(data,cb,eb);
    });
    var pr = new Promise(function(cb,eb){
        sql.getWorksList(data,cb,eb);
    });
    Promise.all([pt,pr]).then(function(data){
        res.send({
            total:data[0][0].total,
            list:data[1]
        });
    },function(err){
        sendError(res,err);
    });
});