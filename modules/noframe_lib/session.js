/**
 * Created by Administrator on 2017/2/16.
 */
//session组件


var wt = require('./util');
var sessionList = {};
var id = 0;
var field = 'w_sid';
function create(res){
    var sid = wt.cryptoSha1(id);
    var session = {
        id:sid
    };
    res.setHeader('Set-Cookie', field + '=' + sid);
    sessionList[sid] = session;
    return session;
}

function check(req){
    var session = getSession(req);
    return session ? true : false;
}

function getSession(req){
    var cookie = req.headers.cookie;
    var cookieData = {};
    cookie.split(';').forEach(function(item){
        var temp = item.split('=');
        cookieData[temp[0].trim()] = temp[1].trim();
    });
    var id = cookie[field];
    return sessionList[id];
}

module.exports={
    get:getSession,
    check:check,
    create:create
};
