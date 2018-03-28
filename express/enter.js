/**
 * Created by Administrator on 2018/1/3.
 */

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var path = require('path');
var session = require('express-session');
var config = require('../config/serverConfig.json');
var wt = require('../modules/util.js');



var bookRouter = require('../routers/book');
// var blogRouter = require('../routers/blogReact');
// var chatRouter = require('../routers/chat');
let indexRouter = require('../routers/blog');

var app = express();
var port = config.port || 8888;


/**
 * 设置模版引擎
 */
app.set('views',path.resolve(__dirname,'../views/ejs'));
app.set('view engine','ejs');

/**
 * 静态资源处理
 * @type {*|Array}
 */
var staticName = config.staticName || [];
if(!wt.isArray(staticName)){
    staticName = [staticName];
}
staticName.forEach(function(name){
    app.use('/' + name,express.static(name));
});
// app.use(multer({ dest: path.resolve(__dirname, 'static/img')}).single('f'));
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
    next();
});

app.use('/book',bookRouter);
app.use('/',indexRouter);

app.get('/favicon.ico',(req,res) => {
    res.send(null);
});


app.listen(port,() =>{
    console.log('the server is started on port '+ port +'!');
});

