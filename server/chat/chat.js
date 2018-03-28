/**
 * Created by Administrator on 2018/2/10.
 */

var http = require('http');
var WebsocketServer = require('websocket').server;
var port = 5000;

var wsServer = new WebsocketServer({
    httpServer:http.createServer().listen(port),
    autoAcceptConnections:true  //是否接收所有请求
});

//autoAcceptConnections 为 false 时有效
wsServer.on('request',function(req){

});

//autoAcceptConnections 为 true 时有效
wsServer.on('connect',function(conn){
    conn.on('message',function(data){
        execAction.call(this,data.utf8Data);
    });
    conn.on('close',function(code,errorMsg){

    })
});

function execAction(msg){

}


