




var caseId = '330100000000201802261025016829';
var security = 0;
var pathname = '/' + location.pathname.split('/')[1];
var caseInfo;
var fjData,fjList;
var caseInfoPromise;
var fjPromise;
var playingMid = '';//正在播放的视频的materialId
var isModify = false;
$(function(){
    checkIsXZ();
    initPlayer();
    dealParam();
    getCaseInfo();
    getFJData();
    initEvent();
    initZoomImg();
    updateReaderTimes();
    loadShInfo();
});

function checkIsXZ(){
    var isXZ = wt.getQueryString("isXZ");
    if(!isXZ){
        $('.isxz').css('display','inline-block');
    }else{
        $('.ismodify').css('display','inline-block');
        isModify = true;
    }
}

function initAttentionBtn(){
    /**是否是收藏案件*/
    var isAttention = true;
    var html,className;
    if(isAttention){
        html = '取消收藏';
        className = 'icon-sc';
    }else{
        html = '添加收藏';
        className = 'icon-nosc';
    }
    $('#attention').html(html).addClass(className).attr('isAttention',isAttention ? 1 : 0);
}

//初始化播放器
function initPlayer(){
    var $videoBox = $('#videoBox');
    if(navigator.userAgent.indexOf("MSIE") > 0){
        var player = $videoBox.attr('type','ie').children().eq(0).css('display','block')[0];
        try{
            player.SetAttribute("LYPLAYEROCX_SELECT_PLAYER", "1");
        }catch(e){
            wt.alert('播放器初始化失败！');
        }
    }else{
        $videoBox.attr('type','chrome').children().eq(1).css('display','block');
    }
}

//处理参数
function dealParam(){
    if(caseId.length > 30){
        if(caseId.charAt(30) == '1'){
            security = 1;
        }
        caseId = caseId.substr(0,30);
    }
}

//获取数据
function getCaseInfo(){
    caseInfoPromise = new wt.Promise(function(cb,eb){
        $.ajax({
            url:"json/caseInfoLoad.json",
            data:{caseId:caseId,security:security},
            success:function(data){
                if(data.CANMODIFY == 1){
                    $('#paEditBtn').css("display","inline-block");
                    $('#ypEditBtn').css("display","inline-block");
                    $('#editBtn').css("display","inline-block");
                }
                if(data.CANDOWNLOAD == 1){
                    $('.ismodify').css("display","inline-block");
                    isModify = true;
                }
                $('#gzxj').html(data.MEMO || '');
                if(data){
                    cb(data);
                }else{
                    eb();
                }
            },
            error:function(){
                eb();
            }
        });
    });
    caseInfoPromise.then(function(data){
        initHtml(data);
        initAttentionBtn();
    },function(e){
        wt.alert('案件信息获取失败，请登录重试！');
    });
}

//初始化页面
function initHtml(data){
    if(data.CASENAME){
        caseInfo = data;
        $('#casename').html(data.CASENAME);
//		$('#viewImgBox').children().attr('src',data.HTTPIMG || pathname + '/commonui/images/searchListIcons/blankImg.png');
        $('#readerTimers').html(data.READERTIMES || 0);
    }else{
        fjData = data;
        addFJToView('viewImgList',['1','2','7']);
        addFJToView('viewVideoList',['3']);
    }
}
//获取附件数据
function getFJData(){
    fjPromise = new wt.Promise(function(cb,eb){
        $.ajax({
            url:'json/getTblViidMaterialList.json',
            data:{
                caseId:caseId,
                security:security
            },
            success:function(result){
                if(result){
                    cb(result);
                }else{
                    eb();
                }
            },
            error:function(){
                eb();
            }
        });
    });
    wt.Promise.all([caseInfoPromise,fjPromise]).then(function(results){	//results为两个ajax的结果数组
        var result = results[1];
        var mid = results[0].DEFAULTIMG || '';
        var data = formatData(result,mid);
        initHtml(data);
    },function(){
        wt.alert('附件信息获取失败！');
    });
}

//处理附件数据，分类别放置	//1:人，2：车，3：视频片段，4：通知书，5：人像库，6：车辆库，7：过程图片
function formatData(data,defaultMid){
    var result = {};
    var typeAry = data.type;
    var rows = data.rows;
    fjList = rows;
    rows.forEach(function(row,index){
        var mid = row.MATERIALID;
        var isWfl = true;

        if(mid == defaultMid){
            result.mFj = row;
        }

        typeAry.forEach(function(type,index){
            if(type.MATERIALIDS.indexOf(mid) != -1){
                isWfl = false;
                var name = type.TYPECODE;
                var ary = result[name];
                if(!ary){
                    ary = result[name] = [];
                }
                var isAdd = false;
                ary.forEach(function(item,index){
                    if(item.id == type.ID){
                        item.push(row);
                        isAdd = true;
                    }
                });
                if(!isAdd){
                    var data = [row];
                    data.id = type.ID;
                    ary.push(data);
                }
            }
        });
        if(isWfl){
            var ary = result['wfl'];
            if(!ary){
                ary = result['wfl'] = [[]];
            }
            ary[0].push(row);
        }
    });
    return result;
}

//添加附件到视图
function addFJToView(id,typeAry){
    var html = '';
    if(!(typeAry instanceof Array)){
        typeAry = [typeAry];
    }
    var data = fjData;

    var row = data.mFj;
    var mid = '';
    var mAry = [];
    if(id == 'viewImgList' && row){
        html += '<li class="view-handler" type="'+ row.FILETYPE +'" mid="'+ row.MATERIALID +'" usrc="'+ row.STOREKEY +'"><div class="imgbox fit">'
            + '<img dsrc="'+ getImgSrc(row) +'"><span class="icon-loading"></span></div></li>';
        mid = row.MATERIALID;
        mAry.push(mid);
    }
    typeAry.forEach(function(type){
        var ary = data[type] || [];
        ary.forEach(function(childAry){
            childAry.forEach(function(row){
                if(mAry.indexOf(row.MATERIALID) == -1){
                    html += '<li class="view-handler" type="'+ row.FILETYPE +'" mid="'+ row.MATERIALID +'" usrc="'+ row.STOREKEY +'"><div class="imgbox fit">'
                        + '<img dsrc="'+ getImgSrc(row) +'"><span class="icon-loading"></span></div></li>';
                    mAry.push(row.MATERIALID);
                }
            });
        });
    });
    var $html = $(html);
    var $box = $('#' + id);
    $box.html($html).prev().find('.view-count').html($html.length);
    if(id == 'viewImgList'){
        setTimeout(function(){
            $box.children().first().trigger('click');
        },100);

    }
    $html.each(function(index,ele){
        var img = ele.querySelector('img');
        cacheImgList.push(img);
    });
    renderImg();
}

function getImgSrc(row){
    var url;
    if(row.FILETYPE == 'SP' || row.FILETYPE == 'DOC'){
        url = row.SPIMG ? row.SPIMG : pathname + row.FULLPATHSHOW;
    }else{
        url = row.STOREKEY;
    }
    return url;
}


function initEvent(){
    $('#tabsList').children().click(function(){
        var $this = $(this);
        if($this.hasClass('active')){
            return;
        }
        $this.addClass('active').siblings().removeClass('active');
        var index = $this.index();
        var $panel = $('#panels').children().removeClass('active').eq(index).addClass('active');
        if(!$panel.attr('inited')){
            $panel.attr('inited',1);
            var type = $panel.attr('type');
            var func = loadModules[type];
            if(typeof func == 'function'){
                func();
            }
        }

    }).eq(1).trigger('click');

    $('#viewFjList').click(function(ev){
        var e = ev || event;
        var target = e.target || e.srcElement;
        var $target = $(target);
        if(!$target.hasClass('view-handler')){
            $target = $target.parent().parent();
        }
        if($target.hasClass('view-handler') && !$target.hasClass('active')){
            var type = $target.attr('type');
            var src = $target.attr('usrc');
            var $imgbox = $('#viewImgBox');
            $(this).find('.active').removeClass('active');
            $target.addClass('active');

            if(type == 'IMG'){
                $imgbox.show().siblings().hide();
                $imgbox.children().css({
                    left:0,
                    top:0,
                    width:'100%',
                    height:'100%'
                }).attr('src',src);
                playVideo(false);
            }else if(type == 'SP'){
                $imgbox.hide().siblings().show();
                playingMid = $target.attr('mid');
                playVideo(true,src);
            }
        }
    });

    $('#effectBox').children('a').click(function(){
        var $this = $(this);
        if(!$this.hasClass('active')){
            $this.addClass('active').siblings().removeClass('active');
        }
    });
}
function initZoomImg(){
    wt.$('#viewImgBox .zoom-ele').zoom().drag();
}
///视频播放
function playVideo(bol,url){
    var $videoBox = $('#videoBox');
    var type = $videoBox.attr('type');
    var player;
    if(type == 'ie'){
        setTimeout(function(){
            player = $videoBox.children()[0];
            try{
                if(bol){
                    player.SetAttribute("LYPLAYEROCX_SELECT_PLAYER", "1");
                    player.CloseFile(1);
                    player.OpenFile(url);
                }else{
                    player.SetAttribute("LYPLAYEROCX_SELECT_PLAYER", "1");
                    player.CloseFile(1);
                }
            }catch(e){
                wt.alert('控件播放失败！');
            }
        },30);
    }else{
        player = $videoBox.children()[1];
        try{
            if(bol){
                player.src = url;
                player.play();
            }else{
                player.pause();
            }
        }catch(e){
            wt.alert('控件播放失败！');
        }
    }
}

//各模块加载方法
var loadModules = {
    caseInfo:function(){
        //加载案件信息
        caseInfoPromise.then(function(data){
            var eles = document.querySelectorAll('#caseInfo .form-value');
            wt.formData({
                list:eles,
                field:'vtext',
                data:data
            });
        });
    },
    ypInfo:function(){
        fjPromise.then(function(result){
            loadYPInfo();
            loadYPInfoForType('ypPerson');
            loadYPInfoForType('ypVehicle');
            loadYPInfoForType('ypGc');
            loadYPInfoForType('ypWord');
            loadYPInfoForType('ypWfl');
        });
    },
    trajectory:function(){
        var url = '/appMap/pGis/map.jsp?paramFrom=caseLinesPage&caseId=' + caseId;
        $('#trajectoryIframe').attr('src',url);
    },
    cbInfo:function(){
        caseInfoPromise.then(function(data){
            if(data.MERGEBH){
                loadCBInfo();
            }else{
                $('#cbBox').siblings().show();
            }
        });
    },
    rxk:function(){
        fjPromise.then(function(result){
            loadRXBDHtml();
        });
    },
    clk:function(){
        fjPromise.then(function(result){
            loadCLBDHtml();
        });
    },
    breakCase:function(){
        caseInfoPromise.then(function(data){
            var eles = document.querySelectorAll('#breakCaseTable .form-value');
            wt.formData({
                list:eles,
                field:'vtext',
                data:data
            });
        });
        addEffectEvent();
        $.ajax({
            url:'json/getFzxyrList.json',
            data:{
                ajbh:caseInfo.OLDCASEID
            },
            success:function(data){
                var html = '';
                var count = [0,0];
                data.forEach(function(item,i){
                    var timeTemp = item.CSRQ.split(' ')[0].split('-');
//						var timeTemp = [];
                    if(item.GA == '1'){
                        count[1]++;
                    }else{
                        count[0]++;
                    }
                    var src = './img/icon_man.png';
                    html += '<div class="pa-item" type="'+ item.GA +'">'
                        +'<table class="info-table">'
                        +'<tr>'
                        +'<td class="td-imgbox" rowspan="6">'
                        +'<div class="pa-img-box"><img src="'+ src +'">'
                        +(item.GA == '1' ? '<span class="icon-zh"></span>' : '')
                        +'</div>'
                        +'</td>'
                        +'<td class="td-value" colspan="3"><span class="pa-name">姓名：</span><span class="pa-value">'+ item.XM +'</span></td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-value" colspan="3"><span class="pa-name">身份证：</span><span class="pa-value">'+ item.SFZ +'</span></td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-value" colspan="3"><span class="pa-name">曾用名/别名：</span><span class="pa-value">无</span></td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-value" colspan="3"><span class="pa-name">户籍地址：</span><span class="pa-value" title="'+ (item.HJDZ || '') +'">'+ (item.HJDZ || '') +'</span></td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-value" colspan="3"><span class="pa-name">抓获日期：</span><span class="pa-value">'+ (item.ZHRQ || '') +'</span></td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-value" colspan="3"><span class="pa-name">抓捕单位：</span><span class="pa-value">'+ (item.ZHDW || '') +'</span></td>'
                        +'</tr>'
                        +'</table>'
                        +'</div>';
                });
                $('#paPanel').html(html);
                $('#paNavBox').children().each(function(i,item){
                    $(item).find('.pa-count').html(count[i]);
                }).eq(0).click();
            }
        });

        $('#paNavBox').children().click(function(){
            var $this = $(this);
            if(!$this.hasClass('active')){
                $this.addClass('active').siblings().removeClass('active');
                var type = $this.attr('type');
                $('#paPanel').children().hide().filter('[type='+ type +']').css('display','inline-block');
            }
        });
    },
    history:function(){
        caseInfoPromise.then(function(data){
            loadHistoryHtml();
        });

    }
};

function loadHistoryHtml(){
    $('#historyTable').datagrid({
        url:'json/getOpLogList.json',
        fit:false,
        fitColumns:true,
        columns:[
            [
                {field:'userName',title:'操作人',align:'center',width:150,fixed:true},
                {field:'action',title:'操作内容',align:'center',fixed:true,width:100,formatter:function(value,row,index){
                    var ary = {
                        "caseInfo-edit":"信息修改",
                        "caseInfo-add":"信息录入",
                        "caseInfo-delete":"信息删除",
                        "caseMaterail-add":"附件添加",
                        "caseMaterail-delete":"附件删除",
                        "caseInfoAnalyze-report":"视频分析报告导出",
                        "caseInfo-view":"信息查看",
                        "caseInfo-pic_view":"图片查看",
                        "caseInfo-pic_dowload":"图片下载",
                        "caseInfo-video_dowload":"录像下载",
                        "caseInfo-video_view":"录像查看",
                        "user-add":"用户添加"
                    };
                    return ary[value] || '';
                }},
                {field:'SActTime',title:'操作时间',align:'center',width:130,fixed:true},
                {field:'yj',title:'操作意见',halign:'center',width:100}
            ]
        ],
        loadFilter:function(result){
            return {
                rows:result.results,
                total:result.totalSize
            };
        },
        onBeforeLoad:function(param){
            param.start = (param.page - 1) * param.rows;
            param.limit = param.rows;
        },
        queryParams:{
            object:caseInfo.OLDCASEID,
            startTime:caseInfo.CREATEDATESTR
        }
    });
}

//加载研判信息
function loadYPInfo(){
    var result = fjData;
    var trajectoryAry = [];
    if(result[7]){
        trajectoryAry = result[7][0];
    }
    var infoPoint = [];
    var overtimePoint = [];
    var locationPoint = [];
    var locationaddr = [];
    var judgeinfo = [];
    var trajectoryCount = 0;
    trajectoryAry.forEach(function(row){
        var info =  row.mark && row.mark.yp;
        if(info){
            info.INFOPOINT && infoPoint.push(info.INFOPOINT);
            info.OVERTIMEPOINT && overtimePoint.push(info.OVERTIMEPOINT);
            info.LOCATIONPOINT && locationPoint.push(info.LOCATIONPOINT);
            info.LOCATIONADDR && locationaddr.push(info.LOCATIONADDR);
            info.JUDGEINFO && judgeinfo.push(info.JUDGEINFO);
        }
        var base = row.mark && row.mark.base;
        if(base && base.LATITUDE != null && base.LONGITUDE != null && base.MATERIALDATE != null){
            trajectoryCount++;
        }
    });

    var personAry = result[1] || [];
    var str = '';
    var manCount = 0;
    var womanCount = 0;
    var count = 0;

    var personNameAry = [];

    personAry.forEach(function(rows){
        for(var i = 0;i < rows.length;i++){
            var row = rows[i];
            var persons = row.mark && row.mark.person || [];
            persons.forEach(function(person){
                count++;
                if(person.GENDERCODE_V == '男'){
                    manCount++;
                }else if(person.GENDERCODE_V == '女'){
                    womanCount++;
                }
                person.NAME && personNameAry.push(person.NAME);
            });
        }
    });

    str = count + ' 人，' + manCount + ' 男 ' + womanCount + ' 女 ';
    if(count - manCount - womanCount > 0){
        str += count - manCount - womanCount + ' 未知';
    }

    var vAry = result[2] || [];
    var vehicleNameAry = [];
    vAry.forEach(function(rows){
        for(var i = 0;i < rows.length;i++){
            var row = rows[i];
            var vehicles = row.mark && row.mark.vehicle || [];
            vehicles.forEach(function(vehicle){
                vehicle.PLATENO && vehicleNameAry.push(vehicle.PLATENO);
            });
        }
    });

    var data = {
        RELATELEVEL:caseInfo.RELATELEVEL,
        RELATEREASON:caseInfo.RELATEREASON,
        CLEARLEVEL:caseInfo.CLEARLEVEL,
        SECURITYLEVEL:caseInfo.SECURITYLEVEL,
        trajectoryCount:trajectoryCount,
        personNCount:str,
        INFOPOINT:infoPoint.join(','),
        OVERTIMEPOINT:overtimePoint.join(','),
        LOCATIONPOINT:locationPoint.join(','),
        LOCATIONADDR:locationaddr.join(','),
        JUDGEINFO:judgeinfo.join(','),
        personName:personNameAry.join(','),
        vehicleName:vehicleNameAry.join(',')
    };
    for(var name in data){
        var func = filterValueMethods[name];
        if(typeof func == 'function'){
            data[name] = func(data[name]);
        }
    }
    var eles = document.querySelectorAll('#ypTable .form-value');
    wt.formData({
        list:eles,
        field:'vtext',
        data:data
    });

    $('#ypTable .empty-to-hide .form-value').each(function(i,target){
        var $target = $(target);
        var field = $target.attr('vtext');
        var func = !data[field] ? 'hide' : 'show';
        $target.closest('td')[func]().prev()[func]();
    });

}
function loadYPInfoForType(id){
    var html = '';
    var $box = $('#' + id);
    var type = $box.attr('type');
    var ary = fjData[type] || [];
    var drawFuncs = {
        ypPerson:'drawEllipseFunc',
        ypVehicle:'changeRectActive',
        ypGc:'drawLineFunc'
    }
    var temps = [];
    ary.forEach(function(childAry,index){
        childAry.forEach(function(row){
            var typeText = '';
            var hasMark = false;
            var markHtml = '';
            var pointStr =  '';
            if(type == '1'){
                typeText = '<p class="item-text">目标嫌疑人'+ (index + 1) +'</span></p>';
                markHtml = getMarkHtmlByType(row.mark,'person');

//				var person = row.person;
//				var pointAry = [];
//				person.forEach(function(rect,index){
//					var str = rect.LEFTTOPX + ',' + rect.LEFTTOPY + ',' + rect.RIGHTBTMX + ',' + rect.RIGHTBTMY;
//					pointAry.push(str);
//				});
//				pointStr = pointAry.join('$');

//				var person = row.person;
//				person.forEach(function(rect,index){
//					var x1 = parseFloat(rect.LEFTTOPX) * 100 + '%';
//					var y1 = parseFloat(rect.LEFTTOPY) * 100 + '%';
//					var width = (parseFloat(rect.RIGHTBTMX) - parseFloat(rect.LEFTTOPX)) * 100 + '%';
//					var height = (parseFloat(rect.RIGHTBTMY) - parseFloat(rect.LEFTTOPY)) * 100 + '%';
//					imgRectHtml += '<div index="'+ index +'" class="img-rect" style="left:'+ x1 +';top:'+ y1 +';width:'+ width +';height:'+ height +'"></div>';
//				});
            }else if(type == '2'){
                typeText = '<p class="item-text">目标嫌疑车'+ (index + 1) +'</span></p>';
                markHtml = getMarkHtmlByType(row.mark,'vehicle');
//				var vehicle = row.vehicle;
//				vehicle.forEach(function(rect,index){
//					var x1 = parseFloat(rect.LEFTTOPX) * 100 + '%';
//					var y1 = parseFloat(rect.LEFTTOPY) * 100 + '%';
//					var width = (parseFloat(rect.RIGHTBTMX) - parseFloat(rect.LEFTTOPX)) * 100 + '%';
//					var height = (parseFloat(rect.RIGHTBTMY) - parseFloat(rect.LEFTTOPY)) * 100 + '%';
//					imgRectHtml += '<div index="'+ index +'" class="img-rect '+ (index == 0 ? 'active' : '') +'" style="left:'+ x1 +';top:'+ y1 +';width:'+ width +';height:'+ height +'"></div>';
//				});
            }else{
                var baseMarkHtml = getMarkHtmlByType(row.mark,'base');
                if(baseMarkHtml){
                    markHtml += '<div class="mark-header"><span class="view-title">基本信息</span></div>' + baseMarkHtml;
                }
                var ypMarkHtml = getMarkHtmlByType(row.mark,'yp');
                if(ypMarkHtml){
                    markHtml += '<div class="mark-header"><span class="view-title">研判信息</span></div>' + ypMarkHtml;
                }
                pointStr = row.LINELOCATION || '';
            }
            html += '<div class="yp-item '+ (markHtml ? 'yp-item2' : '') + ' ' + (typeText ? '' : 'yp-item3') + '">'
                +'<div class="f-item">'
                +'<div class="imgbox" drawFunc="'+ (drawFuncs[id] || '') +'" pointStr="'+ pointStr +'" onclick="openVideoYp(\''+ row.MATERIALID +'\')">'
                +'<img dsrc="'+ getImgSrc(row) +'"><span class="icon-loading"></span>'
                +'</div>'
                + typeText
                +'<p class="item-text">附件名称：<span title="'+ row.FILENAME +'">'+ row.FILENAME +'</span></p>'
                +'<p class="item-text">录入人：'+ (row.USERNAME || '') +'</p>'
                +'<p class="item-text">录入时间：'+ (row.CREATEDATE || '') +'</p>'
                +'</div>'
                +'<div class="mark-box">'
                + markHtml
                +'</div>'
                +'</div>';
            temps.push(row);
        });
    });


    var $html = $(html);
    $box.html($html).prev().find('.view-count').html($html.length);

    var drawConfig = {};
    if(type == '1'){
        drawConfig.person = 1;
    }else if(type == '2'){
        drawConfig.vehicle = 1;
    }else if(type == '7'){
        drawConfig.gc = 1;
    }

    $html.each(function(index,ele){
        var img = ele.querySelector('img');
        cacheImgList.push(img);
        var $imgBox = $(ele).find('.imgbox');
        dealEcharts(temps[index],$imgBox,null,drawConfig);
        $(ele).find('.mark-header-option').first().trigger('click');
    });
    renderImg();
}


function changeRectActive(opt,$div){
    if(opt.color){
        $div.addClass('active');
    }else{
        $div.removeClass('active');
    }
}




//获取标注信息html
function getMarkHtmlByType(marks,type){

    var data = marks[type];
    var isPerVeh = type == 'person' || type == 'vehicle';

    var html = '';
    var tabHtml = '';
    var hasMark = false;
    if(isPerVeh){
        tabHtml += '<div class="mark-tabs">';
        html += '<div class="mark-content">';
        var re = /<li><span class="mark-name">/;
        data.forEach(function(mark,index){
            var name;
            if(type == 'person'){
                name = '人';
            }else{
                name = '车';
            }
            name += index + 1;
            tabHtml += '<div type="'+ type +'" onclick="changeMarkView(this)" class="mark-header-option">'+ name +'</div>';
            var markHtml = getMarkHtml(mark,index,type);
            html += markHtml;
            if(re.test(markHtml)){
                hasMark = true;
            }
        });
        tabHtml += '</div>';
        html += '</div>';
    }else{
        html = getMarkHtml(data,0,type);
        if(html){
            hasMark = true;
        }
    }
    return  hasMark ? isPerVeh ? tabHtml + html : html : '';
}


function getMarkHtml(mark,index,type,bol){
    var config = {
        //人
        person:{
            GENDERCODE:'性别',
            BODYTYPE:'体形',
            HEIGHTLOWERLIMIT:'身高',
            AGELOWERLIMIT:'年龄',
            MEMBERTYPECODE:'特殊人群',
            FACIALFEATURE:'头部特征',
            HAIRSTYLE:'发型',
            UPBODYFEATURE:'上身特征',
            COATSTYLE:'上身穿着',
            COATCOLOR:'上衣颜色',
            COATFEATURE:'上衣特征',
            DOWNBODYFEATURE:'下身特征',
            TROUSERSSTYLE:'下身穿着',
            TROUSERSCOLOR:'下衣颜色',
            SHOESSTYLE:'鞋子款式',
            SHOESCOLOR:'鞋子颜色',
            NAME:'嫌疑人姓名',
            IDNUMBER:'身份证号'
        },
        //车
        vehicle:{
            PLATENO:'车辆号牌',
            PLATECLASS:'号牌类型',
            PLATECOLOR:'号牌颜色',
            VEHICLECLASS:'车辆类型',
            VEHICLEBRAND:'车辆品牌',
            VEHICLEMODEL:'车辆型号',
            VEHICLECOLOR:'车身颜色',
            PLATENOFEATURE:'车牌特征',
            SUNVISOR:'遮阳板',
            SKYWINDOW:'天窗',
            MOTORFACEFEATURE:'车脸特征',
            MOTORBODYFEATURE:'车身特征',
            USINGPROPERTIESCODE:'车辆用途'
        },
        //研判信息
        yp:{
            INFOPOINT:'信息点',
            OVERTIMEPOINT:'超时点',
            LOCATIONPOINT:'落脚点',
            LOCATIONADDR:'落脚点地址',
            JUDGEINFO:'其他'
        },
        //基本信息
        base:{
            MATERIALDATE:'画面时间',
            TIMEDIFF:'时差',
            ACTUALSTARTTIME:'北京时间',
            SXNAME:'点位名称',
            LONGITUDE:'经度',
            LATITUDE:'纬度',
            SOURCETYPERADIO:'监控类别',
            ROADTYPERADIO:'线路类别'
        }
    };

    var html = '';
    var props = config[type];
    var maxTitleLength = 0;
    for(var prop in props){
        var value = mark[prop] || mark[prop + '_V'];
        if(value == undefined || value == ''){
            html += '<li style="display:none;"><span class="mark-name"></span><span></span></li>'
        }else{
            var text = props[prop];
            var func = filterValueMethods[prop];
            if(typeof func == 'function'){
                value = func(value);
            }
            html += '<li><span class="mark-name">'+ text + '：</span><span title="'+ value +'">' + value +'</span></li>';
            maxTitleLength = text.length + 1 > maxTitleLength ? text.length + 1 : maxTitleLength;
        }
    }
    return '<ul class="mark-list title-width-'+ maxTitleLength +' '+ (index == 0 ? 'active' : '') +'">' + html + '</ul>';
}





/**
 * 标注信息tab切换
 */
function changeMarkView(ele){
    var $ele = $(ele);
    if($ele.hasClass('active')){
        return;
    }
    var $oldEle = $ele.siblings('.active');
    var index = $ele.index();
    var oldIndex = $oldEle.index();
    $oldEle.removeClass('active');
    $ele.addClass('active');
    $ele.parent().next().children().removeClass('active').eq(index).addClass('active');
    var $imgBox = $ele.closest('.yp-item').find('.imgbox');

    var actAry = [];
    var otherAry = [];

    var re = new RegExp(index + '$');
    $imgBox.children('div').each(function(i,div){
        var $div = $(div);
        var mtype = $div.attr('mtype') || '';
        if(re.test(mtype)){
            actAry.push($div);
        }else{
            otherAry.push($div);
        }
    });
    echartsActive(actAry,true);
    echartsActive(otherAry);


//	$imgBox.children('div').addClass('echart-hide');
//	$acts.removeClass('echart-hide');

//	var func = $imgBox.attr('drawfunc');
//	var className = func == 'changeRectActive' ? 'img-rect' : 'img-line';
//
//	func = func && window[func];
//	if(typeof func == 'function'){
//		$imgBox.find('.' + className).each(function(ci,item){
//			if(ci == index){
//				func({},$(item));
//			}else if(ci == oldIndex){
//				func({color:'#0993D5'},$(item));
//			}
//		});
//	}

}

function echartsActive(ary,bol){
    for(var i = 0,len = ary.length;i < len;i++){
        var $box = ary[i];
        var type = $box.attr('type');
        if(type){
            var func = type == 'ellipse' ? drawEllipseFunc : drawLineFunc;
            func({
                color:bol ? 'yellow' : 'red'
            },$box);
        }else{
            if(bol){
                $box.addClass('active');
            }else{
                $box.removeClass('active');
            }
        }
        $box.css('zIndex',bol ? 1 : 0);
    }
}


function loadShInfo(){
    $.ajax({
        url:'json/getSHRecordByCaseId.json',
        data:{
            caseId:caseId
        },
        success:function(data){
            data = data[0] || {};
            $('#shTime').html(data.ENDTIMEVALUE || '');
            $('#shUser').html(data.USERNAME || '');
            $('#shState').html(data.STEPNAME || '未审核');
        }
    });
}


//过滤方法集合
var filterValueMethods = {
    LONGITUDE:function(v){
        return +v / 1000000;
    },
    LATITUDE:function(v){
        return +v / 1000000;
    },
    INFOPOINT:function(v){
        v += '';
        var vs = v.split(',');
        var result = [];
        var ary = ['','换衣服','打手机','吐痰','扔烟头','扔其他物品','卖赃物','买东西','取款','乘换交通工具','躲探头','与路人交谈'];
        vs.forEach(function(item){
            result.push(ary[item] || '');
        });
        return result.join(',');
    },
    LOCATIONPOINT:function(v){
        v += '';
        var vs = v.split(',');
        var result = [];
        var ary = ['','旅馆','网吧','洗浴场所','小区'];
        vs.forEach(function(item){
            result.push(ary[item] || '');
        });
        return result.join(',');
    },
    OVERTIMEPOINT:function(v){
        if(!v){
            return null;
        }
        v = '' + v;
        while(v.length < 4){
            v = '0' + v;
        }
        var hour = v.substring(0, 2);
        var minute = v.substring(2);
        return '与上一个探头超时' + hour + '时' + minute + '分';
    },
    TIMEDIFF:function(v){
        v = +v;
        return v ? v > 0 ? '快' + timeTrans(v) : '慢' + timeTrans(-v) : '无';
    },
    SECURITYLEVEL:function(v){
        return v == 1 ? '保密' : v == 2 ? '绝密' : '公开';
    },
    RELATELEVEL:function(v){
        return v == 0 ? '确定关联' : v == 1 ? '可能关联': '其他';
    },
    CLEARLEVEL:function(v){
        return v == 0 ? '清晰唯一可辨' : v == 1 ? '清晰唯一不可辩' : v == 2 ? '模糊' : '';
    }
}

//时间转化
function timeTrans(times){
    var day = Math.floor(times / 3600 / 24);
    var hour = Math.floor((times - day * 3600 * 24) / 3600);
    var minute = Math.floor((times - day * 3600 * 24 - hour * 3600) / 60);
    var second = times - day * 3600 * 24 - hour * 3600 - minute * 60;
    var str = '';
    if(day){
        str += day + '天';
    }
    if(hour){
        str += hour + '时';
    }
    if(minute){
        str += minute + '分';
    }
    return str + second + '秒';
}


//加载串并信息
function loadCBInfo(){
    $.ajax({
        url:'json/getMergeDetailbyCaseId.json',
        data:{
            caseId:caseId
        },
        success:function(data){
            if(data && data.rows){
                var rows = data.rows || [];
                var navHtml = '<ul class="info-tabs">';
                var html = '<div class="w-panels" id="cbPanelBox">';
                rows.forEach(function(item,i){
                    navHtml += '<li>串并案'+ (i + 1) +'</li>';
                    html += '<div class="w-panel detail-box">'
                        +'<table class="info-table">'
                        +'<tr class="tr-hidden">'
                        +'<td class="td-name"></td>'
                        +'<td></td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-name">串并编号：</td>'
                        +'<td class="form-value" vtext="MERGEBH">'+ (item.MERGEBH || '') +'</td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-name">串并标题：</td>'
                        +'<td class="form-value" vtext="MERGETITLE">'+ (item.MERGETITLE || '') +'</td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-name">串并人：</td>'
                        +'<td vtext="MERGEPERSONNAME" class="form-value">'+ (item.MERGEPERSONNAME || '') +'</td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-name">串并单位：</td>'
                        +'<td vtext="MERGEORGNAME" class="form-value">'+ (item.MERGEORGNAME || '') +'</td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-name">串并时间：</td>'
                        +'<td vtext="MERGETIMESTR" class="form-value">'+ (item.MERGETIMESTR || '') +'</td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-name multi-name">简要情况：</td>'
                        +'<td class=""><div vtext="DETAIL" class="multi-value form-value" >'+ (item.DETAIL || '') +'</div></td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-name multi-name">串并依据：</td>'
                        +'<td class=""><div  class="multi-value form-value">'+ (item.MERGECONDITION || '') +'</div></td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-name multi-name">分析意见：</td>'
                        +'<td class=""><div  class="multi-value form-value">'+ (item.MERGEOPINION || '') +'</div></td>'
                        +'</tr>'
                        +'<tr>'
                        +'<td class="td-name multi-name">备注：</td>'
                        +'<td class=""><div vtext="" class="multi-value form-value">'+ (item.DESCRIPTION || '') +'</div></td>'
                        +'</tr>'
                        +'</table>'
                        +'</div>';
                });
                navHtml += '</ul>';
                html += '</div>';
                var $navBox = $(navHtml);
                $('#cbInfoTitle').after(html).after($navBox);
                $navBox.children().click(function(){
                    var $this = $(this);
                    if(!$this.hasClass('active')){
                        $this.addClass('active').siblings().removeClass('active');
                        $this.addClass('active').siblings().removeClass('active');
                        $('#cbPanelBox').children().removeClass('active').eq($this.index()).addClass('active');
                    }
                }).first().click();
            }else{
                wt.alert('信息获取失败！');
            }
        },
        error:function(e){
            wt.alert('信息获取失败！');
        }
    });
    $('#cbBox').show();
    var permission = wt.getQueryString('permission') || '';
    $('#cbIframe').attr('src',pathname + '/servletInvoker.invoke?notitle=1&requestType=dsearch&dtableName=caseInfoListCB&hasBtn=1&permission='+ permission +'&mergeBh=' + caseInfo.MERGEBH);
}


//加入串并方法
function addToCB(){
    if(caseInfo.MERGEBH){
        wt.alert('本案件已加入串并，不可再加入串并！');
        return;
    }
    var id = 'addcb_dialog';
    var $dialog = top.$('#' + id);
    if($dialog.length){
        $dialog.dialog('open');
    }else{
        var url = pathname +'/servletInvoker.invoke?requestType=dsearch&dtableName=PreSerialParallelListAll&notitle=1';
        $dialog = top.$('<div id="'+ id +'"><iframe frameborder="0" allowtransparency="true"></iframe></div>');
        $dialog.dialog({
            title:'选择串并案',
            height:600,
            width:820,
            modal:true,
            buttons:[
                {
                    text:'确定',
                    iconCls:'icon-ok',
                    handler:function(){
                        var iframe = $(this).parent().prev().children('iframe')[0];
                        var win = iframe.contentWindow || iframe.window;

                        var view = win.ViewFactory.getView("seriesAndParallel");
                        var row = view.getSelectedRow();
                        if(row){
                            $.ajax({
                                url:"json/appendToCaseMerger.json",
                                data:{
                                    caseIds:$('#caseId').val(),
                                    mergebh:row.MERGEBH
                                },
                                success:function(result){
                                    if(result.success){
                                        wt.alert('申请加入串案成功！');
                                        $dialog.dialog('close');
                                        $('#andCB').hide();
                                        top.$('#cbItem').show();
                                    }else{
                                        wt.alert('加入失败！');
                                    }
                                },
                                error:function(e){
                                    wt.alert('加入失败！');
                                }
                            });
                        }else{
                            wt.alert('请选择要加入的串并案！');
                        }
                    }
                },
                {
                    text:'关闭',
                    iconCls:'icon-close',
                    handler:function(){
                        $dialog.dialog('close');
                    }
                }]
        }).children('iframe').attr('src',url);
    }
}

//添加协查
function addXC(){
    var url = pathname + '/liveyc/bulletin/jsp/bulletinAddOrEditPage.jsp?noBack=1&bullId=&isAjxc=0&isEdit=false&caseId=' + caseId;
    window.open(url,'xc_window');
}

/**
 * 添加收藏
 */
function addAttention(){
    var isAttention = $('#attention').attr('isAttention') == 1;
    if(isAttention){
        $.ajax({
            data : {
                infoType : caseInfo.CASESOURCE,
                caseId : caseId
            },
            url : 'json/delAttention.json',
            success:function(data){
                if(data && data == "true"){
                    $('#attention').html("添加收藏").removeClass('icon-sc').addClass('icon-nosc').attr('isAttention',0);
                }else{
                    alert("取消失败！");
                }
            },
            error:function(){
                alert("操作失败！");
            }
        });
    }else{
        $.ajax({
            data : {
                infoType : caseInfo.CASESOURCE,
                caseId : caseId
            },
            url : 'json/addAttention.json',
            success:function(data){
                if(data && data == 'true'){
                    $('#attention').html("取消收藏").removeClass('icon-nosc').addClass('icon-sc').attr('isAttention',1);
                }else{
                    alert("收藏失败！");
                }
            },
            error:function(){
                alert("操作失败！");
            }
        });
    }
}

//加载人像比对页面
function loadRXBDHtml(){
    var temp = fjData[1] || [[]];
    var rows = [];
    temp.forEach(function(items){
        items.forEach(function(item){
            rows.push(item);
        });
    });
    loadKuHtml(rows,$('#rxBox'));
    $.ajax({
        url:'json/getCaseMaterialPersonData.json',
        data:{
            caseId:caseId,
            security:security,
            oldCaseId:caseInfo.OLDCASEID
        },
        success:function(result){
            if(result){
                loadKuHtml(result.merge || [],$('#rxCbBox'));
                loadRXBZHtml(result.person || [],$('#rxBzBox'));
            }
        }
    });

}

//加载人像比中页面
function loadRXBZHtml(rows,$box){
    var html = '';
    rows.forEach(function(row,index){
        var dealStatus = row.DEALSTATUS;
        var st = dealStatus == '21' ? '未通过' : dealStatus == '20' ? '通过' : '未审核';
        var sj = dealStatus == '10' || dealStatus >= 20 ? '通过' :  dealStatus == '11' ? '未通过' : '未审核';
        html += '<div class="f-item b-item">'
            +'<div class="b-imgbox" onclick="openRXBZDetail(\''+ row.CASEPERSONID +'\')">'
            +'<div class="b-imgbox-one">'
            +'<div class="imgbox">'
            +'<img dsrc="'+ row.PERSONPHOTOURL +'">'
            +'</div>'
            +'</div>'
            +'<div class="b-imgbox-one">'
            +'<div class="imgbox">'
            +'<img dsrc="'+ row.PERSONCOMPAREURL +'">'
            +'</div>'
            +'</div>'
            +'<div class="b-imgbox-one">'
            +'<div class="imgbox">'
            +'<img dsrc="'+ row.PERSONHITURL +'">'
            +'</div>'
            +'</div>'
            +'</div>'
            +'<p class="item-text"><span class="text-btn" onclick="openRXBZDetail(\''+ row.CASEPERSONID +'\')">'+ row.SOURCEFROMCASEID +'</span></p>'
            +'<p class="item-text">'+ (row.PERSONNAME || '') +'&nbsp;'+ (row.PERSONCERTIFICATE || '') +'</p>'
            +'<p class="item-text">'
            +'<span>市局审核：'+ sj +'</span>'
            +'<span class="fr">省厅审核：'+ st +'</span>'
            +'</p>'
            +'<p class="item-text">比中时间：'+ (row.COMPAREDATE || '') +'</p>'
            +'</div>';
    });
    var $html = $(html);
    $box.html($html).prev().find('.view-count').html(rows.length);
    $html.each(function(index,ele){
        var imgs = ele.querySelectorAll('img');
        for(var i = 0,len = imgs.length;i < len;i++){
            cacheImgList.push(imgs[i]);
        }
    });
    renderImg();
}

/**
 * 打开比中详情
 */
function openRXBZDetail(id){
    window.open(pathname + '/liveyc/portrait/portraitDetail.jsp?casePersonId=' + id,'rxbz_detail');
}

//加载车辆比对页面
function loadCLBDHtml(){
    var temp = fjData[2] || [[]];
    var rows = [];
    temp.forEach(function(items){
        items.forEach(function(item){
            rows.push(item);
        });
    });
    loadKuHtml(rows,$('#clBox'));
    $.ajax({
        url:'json/getCaseMaterialVehicleData.json',
        data:{
            caseId:caseId,
            security:security,
            oldCaseId:caseInfo.OLDCASEID
        },
        success:function(result){
            if(result){
                loadKuHtml(result.merge || [],$('#clCbBox'));
            }
        }
    });
}
function loadKuHtml(rows,$box){
    var html = '';
    rows.forEach(function(row,index){
        var caseText = row.OLDCASEID ? '<p class="item-text">案件编号：<span title="'+ row.OLDCASEID +'" class="text-btn" onclick="openCaseDetail(\''+ row.CASEID +'\')">'+ row.OLDCASEID +'</span></p>' : '';
        html += '<div class="f-item">'
            +'<div class="imgbox" onclick="openVideoYpByCaseId(\''+ row.CASEID +'\',\''+ row.MATERIALID +'\')">'
            +'<img dsrc="'+ getImgSrc(row) +'"><span class="icon-loading"></span>'
            +'</div>'
            + caseText
            +'<p class="item-text">附件名称：<span title="'+ row.FILENAME +'">'+ row.FILENAME +'</span></p>'
            +'<p class="item-text">录入人：'+ row.USERNAME +'</p>'
            +'<p class="item-text">录入时间：'+ row.CREATEDATE +'</p>'
            +'</div>';
    });
    var $html = $(html);
    $box.html($html).prev().find('.view-count').html(rows.length);
    $html.each(function(index,ele){
        var img = ele.querySelector('img');
        cacheImgList.push(img);
    });
    renderImg();
}
/**
 * 根据caseId跟附件id打开视频研判窗口
 */
function openVideoYpByCaseId(caseId,mid){
    window.open(pathname + '/liveyc/caseJudge/view/browseImage/videoJudge.html?caseIds=' + caseId + '&mid=' + mid);
}

/**
 * 根据caseId打开案件详情
 */
function openCaseDetail(caseId){
    window.open(pathname + '/liveyc/caseJudge/caseInfo.jsp?caseId=' + caseId);
}


var cacheImgList = [];
var l = 2;
//渲染图片地址
function renderImg() {
    var length = cacheImgList.length;
    if (cacheImgList.isRun || length == 0) {
        return;
    }
    cacheImgList.isRun = true;
    for (var i = 0; i < l && i < length; i++) {
        setTimeoutImg();
    }
}

function setTimeoutImg() {
    setTimeout(function(){
        var img = cacheImgList.shift();
        if(img){
            var $img = $(img);
            if($img.attr('src')){
                setTimeoutImg();
            }else{
                var errSrc = '../../../../img/1.jpg';
                var src = $img.attr('dsrc') || errSrc;
                $img.one('load', imgLoadEvent).one('error', imgErrorEvent).attr('src',src);
                setTimeout(function() {
                    if (!$img.prop('complete')) {
                        $img.attr('src',errSrc);
                    }
                }, 6000);
            }
        }else{
            cacheImgList.isRun = false;
        }
    },30);
}

function imgLoadEvent() {
    $(this).siblings('.icon-loading').hide();
    setTimeoutImg();
}

function imgErrorEvent() {
    this.src = '../../../../img/1.jpg';
}




//目标辨认
function targetBRFunc(){
    window.open(pathname + '/liveyc/caseidentify/jsp/brAdd.jsp?type=2&i=' + caseInfo.CASEID,'mbbr_window');
}


//下载案件
function downloadFJ(){
    if(isModify){
        var url = [];
        fjList.forEach(function(item,index){
            url.push(item.STOREKEY+"&filename="+item.FILENAME);
        });
        try{
            webOcxUpload.uploadFile(url);
        }catch(e){
            wt.alert('控件下载失败！');
        }
    }else{
        wt.alert('权限不足！');
    }
}
//加入比对
function addCompare2(){
    if(top.addCompare){
        top.addCompare(caseInfo);
    }else{
        try{
            var win = window.opener;
            if(win&&!win.top.bdObj){
                win = win.window.opener;//人像比中详情页面打开案件详情
            }
            if(win && win.top.bdObj){
                win.top.bdObj.addRow(caseInfo);
                wt.alert('添加成功，请返回上个窗口查看！');
            }else{
                wt.alert('当前窗口无法使用比对模块，请从上个窗口重新打开本窗口！');
            }
        }catch(e){
            wt.alert('当前窗口无法使用比对模块，请从上个窗口重新打开本窗口！');
        }
    }
}

//打开经纬度弹窗
function openPosWin(){
    var longitude = $('#LONGITUDE').html();
    var latitude = $('#LATITUDE').html();
    if(!longitude || !latitude){
        wt.alert('对不起，您的经纬度不对！');
        return;
    }
    if (typeof map_url == 'undefined') {
        map_url = "/appMap/pGis/map.jsp";
    }
    var id = 'jwd_dialog';
    var $dialog = top.$('#' + id);
    if($dialog.length){
        $dialog.dialog('open');
    }else{
        $dialog = top.$('<div id="'+ id +'"><iframe frameborder="0" allowtransparency="true"></iframe></div>');
        $dialog.dialog({
            title:'坐标',
            height:500,
            width:700,
            modal:true,
            buttons:[
                {
                    text:'关闭',
                    iconCls:'icon-close',
                    handler:function(){
                        top.$(this).parent().prev().dialog('close');
                    }
                }]
        }).children('iframe').attr('src',map_url+'?paramFrom=caselocationInfo&longitude=' + longitude +'&latitude='+ latitude);
    }
}

//经纬度格式方法
function posFilter(v){
    return v ? parseInt(v)/1000000 : '';
}

//发挥作用格式方法
function effectFilter(v){
    if(v){
        var ary = ['未知','基础','重要','突破'];
        return ary[Number(v)+1] || '';
    }
    return '';
}

//案件类别格式方法
function caseTypeFilter(v){
    return v ? ' - ' + v : '';
}
function videoEffectDescFilter(v){
    if(v){
        return v.replace(/\$/g,',');
    }
    return '';
}
//审核状态
function filterDealStatus(v){
    var config = {
        '0':'待审核',
        '11':'审核退回',
        '40':'已审核',
        '10':'待复核',
        '21':'复核退回',
        '20':'已复核',
        '30':'撤销申请',
        '31':'错误申请'
    };
    return config[v] || '';
}


//视频研判
function openVideoYp(mid){
    var url = pathname + '/liveyc/caseJudge/view/browseImage/videoJudge.html?caseIds=' + caseId;
    if(mid){
        url += '&mid=' + mid;
    }
    window.open(url);
}

//播放视频出错的时候
function OnOpenFile(handle,totalTime){
    if(handle==null||handle==0){
        var isCanPlay = '2';
        updateMaterialIsCanPlay(caseId,playingMid,isCanPlay);
    }
}

//访问次数加1
function updateReaderTimes(){
    $.ajax({
        url:'json/updateCaseReaderTimes.json',
        data:{
            caseId:caseId
        },
        success:function(result){
        }
    });
}

function exportWord(){
    if(isModify){
        var id = 'export_window_321456';
        var $iframe = $('#' + id);
        if($iframe.length === 0){
            $iframe = $('<iframe id="'+ id +'" style="display:none;"></iframe>');
        }
        $('body').append($iframe);

        var url = 'json/exportLabelDoc.json';
        $iframe.attr('src',url)
    }else{
        wt.alert("权限不足！");
    }
}


function ypEditFunc(){
    setDataForYpInput();
    $('#gzxjText').show().prev().hide();
    showBtn([1,2],$('#ypEditBox'));
}
function ypCancelFunc(){
    $('#gzxjText').hide().prev().show();
    showBtn(0,$('#ypEditBox'));
}
function ypSaveFunc(){
    var v = $('#gzxjText').val();
    $.ajax({
        url:'json/setDeFaultImg.json',
        data:{
            caseId:caseId,
            memo:v
        },
        success:function(ret){
            if(ret.success){
                $('#gzxjText').prev().html(v);
                wt.alert('修改成功！');
                ypCancelFunc();
            }else{
                wt.alert('修改失败！');
            }
        },
        error:function(){
            wt.alert('修改失败！');
        }
    });
}

function setDataForYpInput(){
    var $target = $('#gzxjText');
    $target.val($target.prev().html());

}




/** 破案编辑 **/
function paEditFunc(){
    var $table = $('#breakCaseTable');
    if(!$table.data('initInput')){
        $table.data('initInput',1);
        createPaComponent();
    }
    setDataForPaInput();
    $table.hide().next().show();
    showBtn([1,2,3]);
}
function paUpdateFunc(){
    var asjbh = caseInfo.OLDCASEID;
    if(!asjbh){
        wt.alert("案件编号为空，无法导入破案信息！");
        return;
    }
    $.ajax({
        url:'json/getAjSolveCaseByASJBH.json',
        data:{
            ASJBH:asjbh
        },
        success:function(result){
            if(result && !result.msg){
                $('#CASESOLVE').val(result.DETAIL);
                $('#padwInput').combotree('setValue',result.ROLEID);
                $('#padwInput').combotree('setText',result.ROLENAME);
                $('#pasjInput').datetimebox('setValue',result.CLOSEDDATE);//破案时间
            }else{
                if(result.msg){
                    wt.alert(result.msg);
                }
            }
        }
    });
}
function paCancelFunc(){
    $('#breakCaseTable').show().next().hide();
    showBtn(0);
}
function paSaveFunc(){
    var $box = $('#breakEditTable');
    var editEles = $box[0].querySelectorAll('.form-value');
    var data = wt.formData({
        list:editEles,
        field:'field'
    });
    $box.find('.editable-text').each(function(i,elem){
        var $input = $(elem).children('input');
        if($input.length == 0){
            return;
        }
        var field = $input.attr('field');
        var inputType = $input.attr('inputType');
        if(field && inputType){
            data[field] = $input[inputType]('getValue');
        }
    });
    data.CASEINFOSTATUS = $('#ajztInput').combotree('getText');
    data.CASEINFOSTATUSCODE = $('#ajztInput').combotree('getValue');
    var ispa = $("#ajztInput").combotree('tree').tree('getSelected');
    if(ispa){
        ispa = ispa.attributes.ISPA;
    }
    data.caseId = caseInfo.CASEID;
    data.ISCLOSEDCASE=1;
    data.isClosedCase = 1;
    data.isClosedCase = 1;
    var msg = "非破案状态不保存破案信息，确认？";
    if (ispa == '1') {
        data.EFFECT = $('#effectBox .active').attr('value');
        data.CASEBADW = $('#padwInput').combotree('getText');
        data.CASEBADWCODE = $('#padwInput').combotree('getValue');
        data.ISCLOSEDCASE=2;
        data.VIDEOEFFECTDESC = getZymsData();
        data.isClosedCase = 2;
        data.closedDate = data.CLOSEDDATE;
        data.videoEffectDesc = data.VIDEOEFFECTDESC;
        msg = "确认保存？";
    }
    $.dlg.dialog(msg,function(){
        $.ajax({
            url:'json/savePAInfo.json',
            data:data,
            success:function(ret){
                if(ret.success){
                    $.extend(caseInfo,data);
                    var eles = $('#breakCaseTable')[0].querySelectorAll('.form-value');
                    wt.formData({
                        list:eles,
                        field:'vtext',
                        data:data
                    });
                    $box.hide().prev().show();
                    showBtn(0);
                    wt.alert('修改成功！');
                }else{
                    wt.alert('修改失败！');
                }
            },
            error:function(){
                wt.alert('修改失败！');
            }
        });
    });
}

function setDataForPaInput(){
    var eles = $('#breakCaseTable')[0].querySelectorAll('.form-value');
    var data = wt.formData({
        list:eles,
        field:'vtext'
    });
    var $box = $('#breakEditTable');
    var editEles = $box[0].querySelectorAll('.form-value');
    wt.formData({
        list:editEles,
        field:'field',
        data:data
    });
    $box.find('.editable-text').each(function(i,elem){
        var $input = $(elem).children('input');
        if($input.length == 0){
            return;
        }
        var field = $input.attr('field');
        var inputType = $input.attr('inputType');
        if(field && inputType){
            $input[inputType]('setValue',data[field]);
        }
    });
    var effect = data.EFFECT || '0';
    $('#effectBox').children().removeClass('active').filter('[value='+ effect +']').addClass('active');
    $dt('padwInput').setText(caseInfo.CASEBADW);
    $('#ajztInput').combotree('setText',caseInfo.CASEINFOSTATUS);
    setZymsData(caseInfo.VIDEOEFFECTDESC ? caseInfo.VIDEOEFFECTDESC.split('$') : []);
}

function createPaComponent(){
    $('#pasjInput').datetimebox({
        width:219,
        height:26
    });
    $dt('padwInput',"",'combotree').createUI({
        "comType":"combotree",
        "editable" : true,
        "readonly":false,
        "disabled":false,
        "panelHeight":280,
        "noqxz":true,
        width:219,
        height:26,
        onShowPanel:function() {
            var tex = $(this).combotree("getText");
            var id = $(this).combotree("getValue");
            if(id == caseInfo.CASEBADWCODE){
                $(this).combotree('setText',caseInfo.CASEBADW);
            }
        },
        onLoadSuccess:function(){
            var tex = $dt('padwInput').getText();
            var id = $dt('padwInput').getValue();
            if(id == caseInfo.CASEBADWCODE){
                $dt('padwInput').setText(caseInfo.CASEBADW);
            }
        },
        loadFilter : "doLoadSuccess",
        url:'json/getAsyncRoleTree.json',
    });
    $('#ajztInput').combotree({
        url:'json/getAsyncTree.json',
        width:219,
        height:26,
        loadFilter:doLoadSuccess,
        onLoadSuccess:function(){
            if($('#ajztInput').combotree('getValue') == caseInfo.CASEINFOSTATUSCODE){
                $('#ajztInput').combotree('setText',caseInfo.CASEINFOSTATUS);
            }
        }
    });

//	$dt('ajztInput',"",'combotree').createUI({
//		"dtableName" : "infoInput",
//		"comType":"combotree",
//		"editable" : true,
//		"readonly":false,
//		"disabled":false,
//		"panelHeight":270,
//		"noqxz":true,
//		url:"caseAction!getAsyncTree.json?isAll=1&treename=code_ajblzt",
//		width:219,
//		height:26,
//		loadFilter : doLoadSuccess,
//		onBeforeLoad:function(node,param){
//			var data = caseInfo;
//			doBeforeLoadTree.call(this,node,param,data==null?null:data.CASEINFOSTATUS);
//			}
//	});
}

function casebadwLoad(){

}

/**
 * 树的加载前方法模糊匹配
 */
function doBeforeLoadTree(node,param,rootId){
    //页面加载时url暂存并且置空，不加载Tree
    if(!$(this).data("hasFirstLoad")){
        $(this).data("hasFirstLoad",$(this).data("tree").options.url);
        $(this).data("tree").options.url = "";
    }else{
        $(this).data("tree").options.url = $(this).data("hasFirstLoad");
    }
    //参数设置
    if(node&& node.target){
        var data = $(this).tree("getData",node.target);
        param.lev = typeof data.lev == "string"?parseInt(data.lev)+1:data.lev+1;
    }else{
        param.rootId = rootId;
    }
    return true;
}

/**
 * 树的默认加载成功方法，（将字段转为小写）
 * @param data
 */
function doLoadSuccess(data,node){
    var arr = [];
    if($.isArray(data)){
        for(var i=0,len=data.length;i<len;i++){
            var ele = data[i];
            var newEle = {};
            for(var j in ele){
                var key = j.toLowerCase();
                newEle[key] = ele[j];
            }
            arr.push(newEle);
        }
        return arr;
    }
    return data;
}

function showBtn(nums,$box){
    if(!wt.isArray(nums)){
        nums = [nums];
    }
    $box = $box || $('#editBox');
    $box.children().each(function(i,btn){
        var $btn = $(btn);
        if(nums.indexOf(i) != -1){
            $btn.css('display','inline-block');
        }else{
            $btn.hide();
        }
    });
}



/**
 * 选择作用描述
 */
function addEffect(){
    var opt = {
        width:426,
        height:138,
        url:pathname+'/servletInvoker.invoke?requestType=new&dtableName=effectSelect&notitle=1',
        title:'常用作用描述',
        id:'addEffect_win_',
        buttons : [ {
            iconCls : 'icon-ok',
            text : '确定',
            handler : function(){
                var data = formUtil.getDialogFormData('effectSelect','addEffect_win_');
                if(data.effect_text){
                    $('#videoEffectDesc').val(data.effect_text);
                }
                top.$('#addEffect_win_').dialog('close');
            }
        }]
    };
    dialog.openDialog(opt);
}

function openEdit(){
    var url = pathname + '/liveyc/caseInfoVideo/jsp/infoInput2.jsp?caseId='+ caseId +'&showBoot=false';
    window.open(url);
}


function addEffectEvent(){
    $('#zymsShowBox').click(function(e){
        var $target = $(e.target);
        var $item = $target.closest('.zyms-item');
        if($item.length){
            var i = $item.index();
            $('#zymsShowBox').data('list').splice(i,1);
            $item.remove();
        }
    });
}
function addEffectMS(){
    var id = 'zyms_add_dialog';
    var $dialog = $('#' + id);
    if($dialog.length == 0){
        $dialog = $('<div id="'+ id +'"><iframe style="width:100%;height:100%;" frameborder="0"></iframe></div>');
        $dialog.dialog({
            title:'添加作用描述',
            width:600,
            height:305,
            modal:true,
            buttons:[
                {
                    iconCls:'icon-ok',
                    text:'确定',
                    handler:function(){
                        var $iframe = $dialog.children('iframe');
                        var win = $iframe[0].contentWindow;
                        var data = win.getData();
                        win.clear();
                        addZymsItem(data);
                        $dialog.dialog('close');
                    }
                },
                {
                    iconCls:'icon-close',
                    text:'取消',
                    handler:function(){
                        $dialog.dialog('close');
                    }
                }
            ]
        });
        var url = pathname + '/liveyc/zyms/zyms.jsp';
        $dialog.children('iframe').attr('src',url);
    }else{
        $dialog.dialog('open');
    }
}

function addZymsItem(rows){
    if(!$.isArray(rows)){
        rows = [rows];
    }
    var $box = $('#zymsShowBox');
    var list = $box.data('list');
    if(!list){
        list = [];
        $box.data('list',list);
    }
    var html = '';
    for(var i = 0;i < rows.length;i++){
        var row = rows[i];
        var text = row.text;
        if(list.indexOf(text) == -1){
            html += '<div class="zyms-item" fid="'+ (row.value || '') +'"><div class="zyms-text">'+ text +'</div></div>';
            list.push(text);
        }
    }
    $box.append(html);
}

function getZymsData(){
    var list = $('#zymsShowBox').data('list');
    return list ? list.join('$') : '';
}
function setZymsData(ary){
    if(!$.isArray(ary)){
        ary = [ary];
    }
    var data = [];
    for(var i = 0;i < ary.length;i++){
        data.push({
            text:ary[i]
        });
    }
    addZymsItem(data);
}