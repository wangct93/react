/**
 * Created by Administrator on 2018/2/25.
 */

import {dispatch} from '../store';


var socket;

module.exports = (state,action) => {
    console.log(action.type);
    switch(action.type){
        case 'joinRoom':
            addSocketEvent();
            break;
        case 'selfInfo':
            state.info = action.info;
            break;
        case 'addText':
            state.textList.push(action);
            break;
        case 'setUserList':
            state.userList = action.list;
            break;
        case 'addUser':
            state.userList.push(action.user);
            state.textList.push({
                user:action.user,
                text:'加入聊天室'
            });
            break;
        case 'deleteUser':
            state.userList.forEach(function(item,i,ary){
                if(item.id == action.user.id){
                    ary.splice(i,1);
                    state.textList.push({
                        user:action.user,
                        text:'离开聊天室'
                    });
                    return false;
                }
            });
            break;
        case 'sendText':
            let text = {
                type:'sendText',
                text:action.text,
                time:new Date().toFormatString()
            };
            socket.send(JSON.stringify(text));
            text.user = state.info;
            text.type = 'addText';
            state.textList.push(text);
            break;
        case 'historyText':
            state.textList = action.textList;
        default:
            return null;
    }
    return state;
}


function addSocketEvent(){
    socket = new WebSocket('ws://172.16.66.14:5000');
    socket.onopen = function(){
        var temp = document.cookie.split(';').filter(function(item,i){
            return item.split('=')[0].trim() == 'sid'
        });
        var sid = temp.length ? temp[0].split('=')[1].trim() : null;
        socket.send(JSON.stringify({
            sid:sid,
            type:'join'
        }));
    };
    socket.onmessage = function(msg){
        dispatch(JSON.parse(msg.data));
    }
}

