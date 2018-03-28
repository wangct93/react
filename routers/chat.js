/**
 * Created by Administrator on 2018/2/25.
 */

var express = require('express');

var router = express.Router();
var sendError = require('./sendError');

module.exports = router;



var mysql = require('../modules/mysql');


router.post('/login',function(req,res){
    var param = req.body;
    var name = param.name;
    var passwrod = param.password;
    mysql.query('select * from user where userid = "' + name + '" and password = "' + passwrod + '"',function(rows){
        if(rows.length){
            res.cookie('sid',list.length + '',{maxAge:600000000});
            list.push(rows[0]);
            res.send('true');
        }else{
            res.send(null);
        }
    },function(err){
        sendError(res,err);
    });
});

var list = [];



/*8
 设置聊天室服务器
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
        execOther(function(conn){
            conn.send(JSON.stringify({
                type:'deleteUser',
                user:this.userInfo
            }));
        },this);
    });
});

function execAction(msg){
    var action = JSON.parse(msg);
    switch(action.type){
        case 'join':
            this.userInfo = list[action.sid];
            execOther(function(conn){
                conn.send(JSON.stringify({
                    type:'addUser',
                    user:this.userInfo
                }));
            },this);
            this.send(JSON.stringify({
                type:'setUserList',
                list:wsServer.connections.map(function(conn){
                    return conn.userInfo;
                })
            }));
            this.send(JSON.stringify({
                type:'selfInfo',
                info:this.userInfo
            }));
            this.send(JSON.stringify({
                type:'historyText',
                textList:messageList
            }));
            break;
        case 'sendText':
            var info = {
                type:'addText',
                text:action.text,
                time:action.time,
                user:this.userInfo
            };
            execOther(function(conn){
                conn.send(JSON.stringify(info));
            },this);
            messageList.push(info);
            break;
    }
}

var messageList = [];


function execOther(fn,self){
    wsServer.connections.forEach(function(conn){
        if(conn != self){
            fn.call(self,conn);
        }
    });
}



var userList = [];


function User(){

}
User.prototype = {

}