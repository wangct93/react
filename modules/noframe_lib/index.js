/**
 * Created by Administrator on 2017/4/25.
 */


var http = require('http');
var router = require('./router');

var config = require('./config');
var port = config.port;
http.createServer(router).listen(port,function(){
    console.log('the server is started on port  '+ port +'!');
});
