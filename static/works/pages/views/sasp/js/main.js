
//var userInfo = {
//		name:'wang'
//}

var userInfo;
var pathname = location.protocol+'//'+location.host+'/'+location.pathname.split('/')[1];

$(function(){
    $.ajax({
        url:'./json/getViidMenu.json',
        async:false,
        success:function(data){
            if(!data || !data.data || !data.data.length){
                $('#header').append('<a onclick="logOut();" class="header-item header-item-noicon fr">退出</a>');
                return;
            }
            init(data.data);
            if(data.login){
                $.ajax({
                    async:false,
                    url : './json/getUserInfo.json',
                    success : function(result){
                        userInfo = result;
                        setUserName(result.userName);
                        $('#searchBox').show();
                    }
                });
            }
        },
        error:function(e){
            $('#header').append('<a onclick="logOut();" class="header-item header-item-noicon fr">退出</a>');
        }
    });
    initEvent();
    enterEvent();	//绑定回车事件
    inputKeyEvent();
    FullScreen.init();
});
var menuObj;
function init(menus){
    menuObj = new menu('header','left','centerMenu');
    menuObj.createMenu(menus);
    $('#leftFitBtn').click(function(){
        var $Box = $(this).parent().parent();
        if($Box.hasClass('box-collapsed')){
            $Box.removeClass('box-collapsed');
        }else{
            $Box.addClass('box-collapsed');
        }
    });
}

var isSearch = false;
function initEvent(){
    $('#searchBtn').click(function(){
        isSearch = true;
        menuObj.click(60003030);
    });
    if(document.documentMode == 8){
        var placeholderText = '请输入关键词';
        $('#searchInput').bind('blur',function(){
            if(this.value == ''){
                this.value = placeholderText;
            }
        }).bind('focus',function(){
            if(this.value == placeholderText){
                this.value = '';
            }
        }).val(placeholderText);
    }

    fillDefaultUserName();

}

//填充默认用户名
function fillDefaultUserName(){
    var cookie = document.cookie || '';
    var re = /dusername=([^\;$]*)/;
    var match = cookie.match(re);
    if(match){
        $('#username').val(match[1]);
    }
}



function loginComp(data){

    $.ajax({
        type:'post',
        contentType:'text/html',
        url : 'checkUserAccount.do',
        data: data,
        dataType:"json",
        async:false,
        success : function(result){
//                  console.log(result);
        },error:function(){
            alert('登录失败，请联系管理员!');
            return;
        }
    });
}

function loginChildComp(loginData,compName){
    var url = window.location.host;
    url = "http://"+url + '/' + compName;
    $.ajax({
        type:'post',
        contentType:'application/json;charset=UTF-8',
        url : url+'/checkUserAccount.do',
        data: loginData,
        async:false,
        success : function(result){
        }
    });
}

function hideWin(){
    $('#loginWin').hide();
}
function enterEvent(){
    $(document).bind('keydown',function(ev){
        var e= ev || window.event;
        if(e.keyCode==13){
            if(!$('.messager-window').length){
                if(!$("#loginWin").is(":hidden")){//当登录框显示的时候
                    var emailAddr = $('#username').val();
                    var userpw = $('#password').val();
                    if(!emailAddr || emailAddr.length==0){
                        $('#username').focus();
                        return ;
                    }if(!userpw||userpw.length==0){
                        $('#password').focus();
                        return;
                    }
                    login();
                }
            }
        }
    })
}
function inputKeyEvent(){
    $('input').keyup(function(ev){
        var e = ev || event;
        var $deleteBtn = $(this).siblings('.input-close');
        if($deleteBtn.length){
            if(this.value){
                $deleteBtn.children().show();
            }else{
                $deleteBtn.children().hide();
            }
        }
    });
    $('.input-close-icon').click(function(){
        var $this = $(this);
        var $input = $this.parent().siblings('input');
        if($input.length){
            $input.val('');
            $this.hide();
        }
    });
}

function login(){
    var username = $('#username').val();
    var userpw = $('#password').val();
    if(!username){
        $.dlg.alertInfo("账号不能为空！");
        return ;
    }if(!userpw){
        $.dlg.alertInfo("密码不能为空！");
        return;
    }
    var data = {};
    data.emailAddr = username;
    data.userPW = userpw;
    var loginData=liveUtil.toJsonStr(data);
    $.ajax({
        type:'post',
        contentType:'text/html',
        url : 'checkUserAccount.do',
        data: loginData,
        dataType:"json",
        success : function(result){
            if(result==1){
//        	   alert('登录成功');
                var n = new Date();
                n.setMonth(n.getMonth() + 1)
                document.cookie = 'dusername=' + username + ';path=/;expires=' + n.toGMTString();
                location.reload();
            }else if(result==2){
                $.dlg.alertInfo("账号不存在，请确认账号是否正确！");
            }else if(result==3){
                $.dlg.alertInfo("密码错误，请确认密码是否正确！");
            }else if(result==4){
                $.dlg.alertInfo("验证码错误，请重新输入！");
            }
        },error:function(){
            $.dlg.alertInfo("登录失败，请联系管理员！");
            return;
        }
    });
}

function logOut(){
    var id='logOut'+new Date().getTime();
    $.dlg.dialog('确定退出系统吗？',function(){
        $.ajax({
            url : 'logOut.do',
            dataType:"json",
            data : null
        }).always(function(){
            top.location.reload();
        });},$.noop(),{id:id});
    $('#'+id).parent().next().next().append('<iframe  scrolling="no" frameborder="0" style="width:100%;height:100%;border:none;position:absolute;z-index:-1;top:0;left:0;filter:Alpha(opacity=0);" src="about:blank"></iframe>');
}

function forwardLogin(){
    var local = window.location;
    var ipport = local.hostname;
    var path = local.pathname;
    var contextPath = path.split("/")[1];
    window.location.href = "https://"+ipport+":8443/"+contextPath+"/usercertTool.jsp?port="+local.port;
}



/**
 * 用户信息
 */
function openUserInfo(){
    var user = top.userInfo||{};
    var newheight = 479;
    if(user.isSuperAdmin == 1){
        newheight = 415;
    }
    var opt = {
        title:'用户信息',
        modal:true,
        width:350,
        height:newheight,
        url:'view/userInfo/userInfo.html',
        buttons:[
            {
                iconCls:'icon-ok',
                text:'确定',
                handler:editInfo
            },
            {
                iconCls:'icon-close',
                text:'取消',
                handler:closeInfoDialog
            }
        ],
        id:'userInfo_win'
    };
    openDialog(opt);
}

function openDialog(opt){
    var id = opt.id || 'dialogId_' + (+new Date());
    var t$ = top.$;
    var $target = t$('#'+ id);
    if($target.length){
        $target.dialog('open');
    }else{
        $target = t$('<div id="' + id + '"><iframe scrolling="no" frameborder="0" allowtransparency="true" src="" style="height: 100%;width: 100%;border: none;position:relative;"></iframe></div>');
        t$('body').append($target);
        $target.dialog(opt).children().attr('src',opt.url);
    }
}
/**
 * 修改用户信息
 */
function editInfo(){
    var iframe = top.$('#userInfo_win').find('iframe')[0];
    var win = iframe.window || iframe.contentWindow;
    var data = win.getInfo();

    var oldPW = $.trim(data.oldPW);
    if(oldPW == ""){
        $.dlg.alertError("请输入原密码！");
        return;
    }
    data.oldPW = md5(oldPW);

    var userPW = $.trim(data.userPW);
    var checkUserPW = $.trim(data.checkUserPW);
    if(userPW != checkUserPW){
        $.dlg.alertError("二次输入的密码不一致，请重新输入！");
        return;
    }
    if(userPW!=null&&userPW!=""){
        data.userPW = md5(userPW);
        data.checkUserPW = md5(checkUserPW);
    }

    var policeNumber = $.trim(data.policeNumber);
    if(data.userType=="1"&&policeNumber == ""){
        $.dlg.alertError("请输入警号！");
        return;
    }

    $.dlg.dialog("确定要保存修改的信息吗？",function(){
        $.ajax({
            type:'post',
            data:data,
            url:'/appSystem/userAction!updateGeUserDomViid.do',
            success:function(result){
                if(result && result.success){
                    if(!data.userPW){//不修改pw
                        data.userPW = data.oldPW;
                    }
                    $.extend(top.userInfo,data);
                    refreshGeUser(top.userInfo.userPW);
                    top.$('#userInfo_win').dialog('destroy');
                    $.dlg.alertInfo("保存成功！");
                }else{
                    $.dlg.alertInfo(result.msg || "保存失败！");
                }
            },error:function(){
                $.dlg.alertInfo("保存失败！");
            }
        });
    });
}
/**
 * 刷新后台geUser
 */
function refreshGeUser(pw){
    $.ajax({
        type:'post',
        url:'refreshGeUser.do',
        data:{pw:pw},
        success:function(){

        }
    });
}

function setUserName(str){
    if(!str){
        return '';
    }
    var re = /[\u4e00-\u9fa5]/;
    var count = 0;
    var newStr;
    for(var i = 0;i < str.length;i++){
        if(re.test(str.charAt(i))){
            count += 2;
        }else{
            count++;
        }
    }
    var $ele = $('#cname');
    if(count > 10){
        $ele.attr('title',str);
        str = str.substr(0,2) + '****' + str.substr(str.length - 2);
    }
    $ele.html(str);
}

function closeInfoDialog(){
    var iframe = top.$('#userInfo_win').find('iframe')[0];
    var win = iframe.window || iframe.contentWindow;
    win.setInfo(win.info);//关闭前重置用户信息
    closeDialog.call(this);
}

function closeDialog(){
    var t$ = top.$;
    var $target = t$(this).parent().prev();
    $target.dialog('close');
}


function fullScreenFunc(ele){
    var $ele = $(ele);
    if($ele.data('full')){
        if(exitFullScreen()){
            $ele.data('full',null);
            $ele.attr('title','全屏');
        }
    }else{
        if(openFullScreen()){
            $ele.data('full',1);
            $ele.attr('title','退出全屏');
        }
    }
}


/**
 * 全屏
 * @param element
 */

function openFullScreen() {
    // 判断各种浏览器，找到正确的方法
    var ele = document.body;
    var requestMethod = ele.requestFullScreen || //W3C
        ele.webkitRequestFullScreen ||    //Chrome等
        ele.mozRequestFullScreen || //FireFox
        ele.msRequestFullscreen; //IE11
    if (requestMethod) {
        requestMethod.call(ele);
    }
    else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
        try{
            var wscript = new ActiveXObject("WScript.Shell");
            wscript.SendKeys("{F11}");
        }catch(e){
            $.dlg.alertInfo('请先将本站加入信任站点，并允许ActiveX控件交互，再进行全屏操作！');
        }
    }
}

//退出全屏 判断浏览器种类
function exitFullScreen() {
    // 判断各种浏览器，找到正确的方法
    var exitMethod = document.exitFullscreen || //W3C
        document.mozCancelFullScreen ||    //Chrome等
        document.webkitExitFullscreen || //FireFox
        document.webkitExitFullscreen; //IE11
    if (exitMethod) {
        exitMethod.call(document);
    }
    else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
        try{
            var wscript = new ActiveXObject("WScript.Shell");
            wscript.SendKeys("{F11}");
        }catch(e){
            $.dlg.alertInfo('请先将本站加入信任站点，并允许ActiveX控件交互，再进行全屏操作！');
        }
    }
}



var FullScreen = {
    init:function(){
        this.addEvent();
    },
    addEvent:function(){
        var _this = this;
        $('#fullScreenBtn').click(function(){
            _this.open();
        });
        if(document.addEventListener){
            var ary = ['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'];
            var func = function(){
                _this.changeBtnState();
            };
            for(var i = 0;i < ary.length;i++){
                document.addEventListener(ary[i],func);
            }
        }
    },
    changeBtnState:function($ele){
        $ele = $ele || $('#fullScreenBtn');
        $ele.unbind('click');
        var _this = this;
        if($ele.attr('title') == '全屏'){
            $ele.click(function(){
                _this.exit();
            }).attr('title','退出全屏');
        }else{
            $ele.click(function(){
                _this.open();
            }).attr('title','全屏');
        }
    },
    open:function(){
        var body = document.body;
        var requestMethod = body.requestFullScreen || //W3C
            body.webkitRequestFullScreen ||    //Chrome等
            body.mozRequestFullScreen || //FireFox
            body.msRequestFullscreen; //IE11
        if (requestMethod) {
            requestMethod.call(body);
        }
        else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
            try{
                var wscript = new ActiveXObject("WScript.Shell");
                wscript.SendKeys("{F11}");
                this.changeBtnState();
            }catch(e){
                $.dlg.alertInfo('请先将本站加入信任站点，并允许ActiveX控件交互，再进行全屏操作！');
            }
        }
    },
    exit:function(){
        var exitMethod = document.exitFullscreen || //W3C
            document.mozCancelFullScreen ||    //FireFox等
            document.webkitExitFullscreen || //Chrome
            document.msExitFullscreen; //IE11等


        if (exitMethod) {
            exitMethod.call(document);
        }
        else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
            try{
                var wscript = new ActiveXObject("WScript.Shell");
                wscript.SendKeys("{F11}");
                this.changeBtnState();
            }catch(e){
                $.dlg.alertInfo('请先将本站加入信任站点，并允许ActiveX控件交互，再进行全屏操作！');
            }
        }
    }
}



