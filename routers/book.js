/**
 * Created by Administrator on 2018/1/9.
 */


let express = require('express');
let router = express.Router();

let Book = require('../server/book/book');
let sendError = require('./sendError');

let {getBookList,getBookInfo,getChapterInfo} = Book;

router.get('/getList',(req,res) => {
    let {query} = req;
    getBookList(query,function(data){
        res.send(data);
    },(err) => {
        sendError(res,err);
    });
});
router.get('/getInfo',(req,res) => {
    let {query} = req;
    let {bookId} = query;
    getBookInfo(bookId,function(data){
        res.send(data);
    },(err) => {
        sendError(res,err);
    })
});
router.get('/chapter',(req,res) => {
    let {query} = req;
    let {chapterId} = query;
    getChapterInfo(chapterId,function(data){
        res.send(data);
    },(err) => {
        sendError(res,err);
    })
});

module.exports = router;