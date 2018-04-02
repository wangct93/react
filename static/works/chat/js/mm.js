/**
 * Created by Administrator on 2018/2/10.
 */
/**
 * Created by Administrator on 2016/9/28.
 */
String.prototype.toJSON=function(sep,eq){
    sep=sep||'&';
    eq=eq||'=';
    var obj={};
    if(this.length){
        var ary=this.split(sep);
        ary.forEach(function(item,index){
            if(item){
                var ary=item.split(eq);
                obj[ary[0].trim()]=ary[1]&&ary[1].trim();
            }
        });
    }
    return obj;
};
var cookie=document.cookie.toJSON(';');
var name;
getName();
var  wsServer = 'ws://localhost:8000';
var  websocket = new WebSocket(wsServer);
websocket.onopen = function (ev) {
    this.send('conn?'+name);
};
websocket.onmessage = function (ev){
    var str=ev.data;
    var ary=str.split('?');
    var path=ary[0];
    switch(path){
        case 'close':
            roomEvent.removeUser(ary[1]);
            break;
        case 'addText':
            var user=ary[1].toJSON(';');
            roomEvent.addText(user);
            break;
        case 'userList':
            ary=ary[1].split(';');
            ary.forEach(function(item,index){
                if(item){
                    roomEvent.addUser(item);
                }
            });
            break;
        case 'addUser':
            roomEvent.addUser(ary[1]);
    }
};
websocket.onerror = function (ev) {
    console.log(ev);
};

var roomEvent={
    removeUser:function(name){
        var box=document.getElementById('users');
        var child=box.children;
        for(var i=0,l=child.length;i<l;i++){
            if(child[i].innerHTML==name){
                box.removeChild(child[i]);
                break;
            }
        }
        var li=document.createElement('li');
        li.innerHTML=name+'已经离开聊天室';
        li.className='tip';
        content.appendChild(li);
        console.log(name + ' leave the room!');
    },
    addUser:function(name){
        var box=document.getElementById('users');
        var li=document.createElement('li');
        li.innerHTML=name;
        box.appendChild(li);
        var tip_li=document.createElement('li');
        tip_li.innerHTML=name+'进入聊天室';
        tip_li.className='tip';
        content.appendChild(tip_li);
    },
    addText:function(obj){
        var box=document.getElementById('content');
        var li=document.createElement('li');
        li.innerHTML='<li><div class="content-user"><span>'+obj.name+'</span><span class="mgl10">'+obj.time+'</span></div><div class="content-content">'+obj.text+'</div></li>';
        box.appendChild(li);
    }
};
window.onload=function(){
    var btn=document.getElementById('btn');
    btn.addEventListener('click',function(ev){
        var value=text.value;
        if(value){
            websocket.send('text?'+value);
            text.value='';
        }else{
            alert('信息不能为空！');
        }

    },false);
};

function getName(){
    var http=new XMLHttpRequest();
    http.open('post','/getName',false);
    http.onload=function(){
        var text=http.responseText;
        if(text == 'error'){
            location.href='/';
        }else{
            name=http.responseText;
        }
    };
    http.send('sessId='+cookie.sessId);
}