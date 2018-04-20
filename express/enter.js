/**
 * Created by Administrator on 2018/1/3.
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const config = require('../modules/config');
const wt = require('../modules/util.js');

const funcRouter = require('../routers/api');


const bookRouter = require('../routers/book');
// var blogRouter = require('../routers/blogReact');
// var chatRouter = require('../routers/chat');
const indexRouter = require('../routers/blog');

const app = express();
const port = config.port || 8888;


/**
 * 设置模版引擎
 */
app.set('views',path.resolve(__dirname,'../views/ejs'));
app.set('view engine','ejs');

/**
 * 静态资源处理
 * @type {*|Array}
 */
let staticName = config.staticName || [];
if(!wt.isArray(staticName)){
    staticName = [staticName];
}
staticName.forEach(name => {
    app.use('/' + name,express.static(name));
});
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret:'wangct',
    name:'ssid',
    cookie:{
        maxAge:6000,
        secret:true
    },
    resave:false,
    saveUninitialized:true
}));

/***********************/
app.use('/',(req,res,next) => {
    console.log('请求地址：' + req.url);
    let headers = config.responseHeaders;
    for(let name in headers){
        if(headers.hasOwnProperty(name)){
            res.setHeader(name,headers[name]);
        }
    }
    next();
});

app.use('/',funcRouter);

app.use('/',indexRouter);
app.use('/book',bookRouter);

app.get('/favicon.ico',(req,res) => {
    res.send(null);
});

app.listen(port,() =>{
    console.log('the server is started on port '+ port +'!');
});

