/**
 * Created by Administrator on 2018/1/9.
 */


var express = require('express');
var router = express.Router();


module.exports = router;

let book = require('../server/book/book');
let sendError = require('./sendError');
var wt = require('../modules/util');
let blogObj = require('../server/blog/blog');


router.get('/',(req,res) => {
    res.status(301).setHeader('location','../static/react/index.html');
    res.send();
})

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


