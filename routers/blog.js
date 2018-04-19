/**
 * Created by Administrator on 2018/1/9.
 */


let express = require('express');
let router = express.Router();


module.exports = router;

let book = require('../server/book/book');
let sendError = require('./sendError');
let wt = require('../modules/util');
let blogObj = require('../server/blog/blog');
let commentObj = require('../server/comment/comment');
let worksObj = require('../server/works/works');

let config = require('../modules/config');
let {nosql} = config;
let nosqlData = require('../server/data/data');

let url = require('url');

router.use('/',(req,res,next) => {
    let pathname = url.parse(req.url).pathname;
    if(nosql && nosqlData[pathname]){
        res.send(nosqlData[pathname]);
    }else{
        next();
    }
});

router.get('/',(req,res) => {
    res.status(301).setHeader('location','../static/react/index.html');
    res.send();
});

const formidable = require('formidable');
const path = require('path');




router.get('/getHomeViewList',(req,res) => {
    let {type} = req.query;
    let promiseAry = [];
    if(!type || type === 'blog'){
        promiseAry[promiseAry.length] = new Promise((cb,eb) => {
            blogObj.getList({
                start:0,
                limit:30
            },cb,eb);
        });
    }
    if(!type || type !== 'story'){
        promiseAry[promiseAry.length] = new Promise((cb,eb) => {
            book.getList({
                limit:30,
                start:0
            },cb,eb);
        });
    }
    Promise.all(promiseAry).then((result) => {
        res.send(result.reduce((old,cur) => {
            return old.concat(cur);
        }));
    },(err) => {
        sendError(res,err);
    })
});
router.get('/getBlogInfo',(req,res) => {
    let {blogId} = req.query;
    blogObj.getInfo(blogId,(data) => {
        res.send(data);
    },(err) => {
        sendError(res.err);
    });
});

router.get('/getStoryList',(req,res) => {
    book.getListAndTotal(req.query,(data) => {
        res.send(data);
    },(err) => {
        sendError(res,err);
    });
});

router.get('/getBlogList',(req,res) => {
    blogObj.getListAndTotal(req.query,(data) => {
        res.send(data);
    },(err) => {
        sendError(res,err);
    });
});


router.get('/getCommentList',(req,res) => {
    commentObj.getListAndTotal(req.query,(result) => {
        res.send(result);
    },(err) => {
        sendError(res,err);
    });
});
router.get('/submitComment',(req,res) => {
    commentObj.insert(req.query,(result) => {
        res.send(result);
    },(err) => {
        sendError(res,err);
    });
});


router.get('/getWorksList',(req,res) => {
    worksObj.getListAndTotal(req.query,(result) => {
        res.send(result);
    },(err) => {
        sendError(res,err);
    });
});
