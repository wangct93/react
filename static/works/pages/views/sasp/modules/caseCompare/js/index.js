
var caseIds = '1161126,430600000000201802081923502531';
var pathname = '/' + location.pathname.split('/')[1];
var dataList = [];
var gcList = {};
var errorSrc = '../../../../img/1.jpg';
$(function(){
    initPlayer();
    initHtml();
    initDropdown();
    initEvent();
    initCbComponent();
    initDragZoomEvent();
});

var loadCount = 0;
//获取数据
function getData(index,cb){
    var data = dataList[index];
    if(data){
        if(typeof cb == 'function'){
            cb();
        }else{
            loadCase(index,cb);
        }
    }else{
        showLoading();
        loadCount++;
        var caseId = caseIds.split(',')[index];
        var p1 = new wt.Promise(function(cb,eb){
            $.ajax({
                url:'json/getCaseMaterialList'+ (index + 1) +'.json',
                data:{
                    caseId:caseId
                },
                success:cb,
                error:eb
//					loadCount--;
//					if(!loadCount){
//						hideLoading();
//					}
//					dataList[index] = data[0];
//					if(!data[0].ypInfo){
//						data[0].ypInfo = getYpInfo(data[0]);
//					}
//					if(typeof cb == 'function'){
//						cb();
//					}else{
//						loadCase(index,cb);
//					}
//				}
            });
        });
        var p2 = new wt.Promise(function(cb,eb){
            $.ajax({
                url:'json/getSHRecordByCaseId.json',
                data:{
                    caseId:caseId
                },
                success:cb,
                error:eb
            });
        });
        wt.Promise.all(p1,p2).then(function(result){
            var data = result[0][0];
            var shInfo = result[1][0]|| {};
            data.shInfo = shInfo;
            loadCount--;
            if(!loadCount){
                hideLoading();
            }
            dataList[index] = data;
            if(!data.ypInfo){
                data.ypInfo = getYpInfo(data);
            }
            if(typeof cb == 'function'){
                cb();
            }else{
                loadCase(index,cb);
            }
        },function(){
            loadCount--;
            if(!loadCount){
                hideLoading();
            }
            $.dlg.alertInfo('获取信息失败！');
        });
    }
}


//初始化页面
function initHtml(){
    var len = caseIds.split(',').length;
    for(var i = 0;i < len && i < 2;i++){
        getData(i,i);
    }
}

/**
 * 初始化串并组件
 */
var cbObj;
function initCbComponent(){
    cbObj = new Compare({
        maxLength:4,
        title:'串并',
        url:pathname + '/liveyc/seriesAndParallel/jsp/caseMerger.jsp?sq=1',
        fields:{
            src:'HTTPIMG',
            caseId:'CASEID',
            oldCaseId:'OLDCASEID',
            title:'CASENAME',
            time:'STRCASETIME'
        },
        wrapEle:$('body'),
        top:90,
        right:16
    });
}

//初始事件
function initEvent(){
    $('#targetBox').children().click(function(ev){
        var e = ev || event;
        var target = e.target || e.srcElement;
        var $target = $(target).closest('.f-item');
        if($target.length && !$target.hasClass('active')){
            $target.addClass('active').siblings().removeClass('active');
            var $list = $target.parent();
            var index = $list.attr('index');		//当前点击区域为左边还是右边
            var rows = $list.data('data');
            var row = rows[$target.index()];
            var $views = $target.closest('.target-fj').prev().children().children();
            var url = row.STOREKEY;
            if(row.FILETYPE == 'IMG'){
                playVideo(false,$views.eq(1));
                var $imgBox = $views.first();
                $imgBox.css({
                    left:0,
                    top:0,
                    width:'100%',
                    height:'100%'
                });
                $imgBox.find('.view-img').attr('src',url);
                $imgBox.find('.img-rect').remove();
                $imgBox.find('.img-line').remove();
                dealEcharts(row,$imgBox);
                $imgBox.show().next().hide();
            }else{
                playVideo(true,$views.eq(1),url);
                $views.hide().eq(1).show();
            }
            updateMark(row.mark || {},index);
        }
    });
    $('.move-btn').click(function(){
        var $this = $(this);
        var range = $this.hasClass('move-right') ? 12 : -12;
        var box = $this.siblings('div').children()[0];
        var count = 0;
        var timer = setInterval(function(){
            box.scrollLeft += range;
            count++;
            if(count > 9){
                clearInterval(timer);
            }
        },30);
    });
    $('.change-case').click(function(ev){
        var e = ev || event;
        var target = e.target || e.srcElement;
        var $target = $(target);
        var $list = $(this).find('.change-menu');
        if(!$list.find('.active').length){
            $.dlg.alertInfo('当前没有可切换的案件！');
            return;
        }
        if($target.hasClass('case-text')){
            var rowIndex = $target.attr('rowIndex');
            var index = $(this).parent().parent().index();
            getData(rowIndex,index);
            $target.parent().parent().hide();
        }else if(!$target.hasClass('change-menu')){
            if($list.is(':visible')){
                $list.hide();
            }else{
                $('.change-menu').hide();
                $list.show();
            }
        }
        if(e.stopPropagation){
            e.stopPropagation();
        }else{
            e.cancelBubble = true;
        }
    });
    $(document).click(function(){
        $('.change-menu').hide();
    });

    $('#selectBox').children().click(function(){
        var $this = $(this);
        if(!$this.hasClass('active')){
            $this.addClass('active').siblings().removeClass('active');
            var type = $this.attr('type');
            filterFj(type);
        }
    });
    $('#navBox').children().click(function(){
        var $this = $(this);
        if(!$this.hasClass('active')){
            $this.addClass('active').siblings().removeClass('active');
            var index = $this.index();
            $('#panelBox').children().removeClass('active').eq(index).addClass('active');
            if(index == 2 && !$this.data('loaded')){
                $('#mapIframe').attr('src',$this.data('url'));
                $this.data('loaded',1);
            }
        }
    }).eq(0).click();


    $('.fit-btn').mousedown(function(e){
        var $this = $(this);
        var $line = $('#resizeLine');
        var $body = $('body');
        if($line.length === 0){
            $line = $('<div class="fit-line"></div>');
            $body.append($line);
        }
        var rect = $this.closest('td')[0].getBoundingClientRect();
        var w = rect.width || rect.right - rect.left;

        var ox = e.clientX;
        var oy = e.clientY;
        var isMove = false;

        function mousemove(e){
            var cx = e.clientX;
            var cy = e.clientY;
            if(isMove){
                $line.css('top',e.clientY + 'px');
            }else if(Math.abs(cx - ox) > 10 || Math.abs(cy - oy) > 10){
                isMove = true;
                $line.css({
                    width:w + 'px',
                    left:rect.left + 'px',
                    display:'block'
                });
            }

        }
        function mouseup(e){
            $body.unbind('mousemove',mousemove);
            $body.unbind('mouseup',mouseup);
            $line.hide();
            if(isMove){
                var type = $this.attr('type');
                var h = e.clientY - rect.top;
                $('#ypBox').find('[type='+ type +']').prev().css('height',h);
            }
        }
        $body.mousemove(mousemove).mouseup(mouseup);
    });
    $('body')[0].onselectstart = function(){
        return false;
    }
}



//初始化播放器
function initPlayer(){
    var $box = $('#targetBox');
    if(navigator.userAgent.indexOf("MSIE") > 0){
        $box.find('.video-box').attr('type','ie').find('object').css('display','block');
    }else{
        $box.find('.video-box').attr('type','chrome').find('video').css('display','block');
    }
}
///视频播放
function playVideo(bol,$box,url){
    var type = $box.attr('type');
    var player;
    if(type == 'ie'){
        setTimeout(function(){
            player = $box.children()[0];
            if(bol){
                try{
                    player.SetAttribute("LYPLAYEROCX_SELECT_PLAYER", "1");
                    player.CloseFile(1);
                    player.OpenFile(url);
                }catch(e){
                    $.dlg.alertInfo('控件播放失败！');
                }
            }else{
                try{
                    player.SetAttribute("LYPLAYEROCX_SELECT_PLAYER", "1");
                    player.CloseFile(1);
                }catch(e){}
            }
        },30);
    }else{
        player = $box.children()[1];
        try{
            if(bol){
                player.src = url;
                player.play();
            }else{
                player.pause();
            }
        }catch(e){
            $.dlg.alertInfo('控件播放失败！');
        }
    }
}

/**
 * 加载案件信息
 * @param rowIndex		要加载案件的索引
 * @param index			填充表格的索引
 */
function loadCase(rowIndex,index){
    var data = dataList[rowIndex].result;
    loadBaseInfo(data.caseInfo,index);
    loadFJList(data.data,index);
    $('#baseInfo').children().eq(index || 0).attr('rowIndex',rowIndex);
    changeDropdown();
    updateYpInfo(dataList[rowIndex].ypInfo,index);
    updateMapAddr();
}

//加载基本信息
function loadBaseInfo(row,index){
    var $box = $('#baseInfo').children().eq(index || 0);
    $box.find('.info-img').attr('src',row.HTTPIMG || '');
    var eles = $box[0].querySelectorAll('.form-value');
    wt.formData({
        list:eles,
        field:'vtext',
        data:row
    });
}


//加载附件信息

function loadFJList(rows,index){
    var $box = $('#targetBox').children().eq(index || 0);
    var html = '';
    var gcAry = [];
    rows.forEach(function(row,index){
        html += '<li class="f-item">'
            +'<div class="imgbox">'
            +'<img class="render-img" dsrc="'+ getImgSrc(row) +'">'
            +'<span class="icon-loading"></span>'
            +'</div>'
            +'</li>';
        if(row.TYPECODE && row.TYPECODE.indexOf('7') != -1){
            gcAry.push(row);

        }
    });
    if(rows[0]){
        gcList[rows[0].CASEID] = gcAry;
    }
    var $html = $(html);
    $box.find('.fj-list').html($html).data('data',rows).children().first().trigger('click');
    $html.each(function(index,ele){
        var img = ele.querySelector('.render-img');
        cacheImgList.push(img);
    });
    renderImg();
}
//获取图标地址
function getImgSrc(row){
    var url;
    if(row.FILETYPE == 'IMG'){
        url = row.STOREKEY;
    }else{
        url = pathname + row.FULLPATHSHOW;
    }
    return url;
}

//渲染图片地址
var cacheImgList = [];
var l = 2;

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
    var img = cacheImgList.shift();
    if(img){
        var $img = $(img);
        if($img.attr('src')){
            setTimeoutImg();
        }else{
            var errSrc = errorSrc;
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
}

function imgLoadEvent() {
    $(this).siblings('.icon-loading').hide();
    setTimeout(function() {
        setTimeoutImg();
    }, 30);
}

function imgErrorEvent() {
    this.src = errorSrc;
}


function updateMapAddr(){
    var temp = [];
    $('#baseInfo .case-item').each(function(i,item){
        var rIndex = $(item).attr('rowIndex');
        rIndex != null && temp.push(dataList[rIndex].caseId);
    });
    var url = '/appMap/pGis/map.jsp?paramFrom=contrastCaseLineByIds&caseIds=' + temp.join(',');
    var $target = $('#mapTab');
    if($target.hasClass('active')){
        $('#mapIframe').attr('src',url);
        $target.data('loaded',1);
    }else{
        $target.data('url',url).removeData('loaded');
    }
}


//更新标注信息
function updateMark(marks,index){
    var $box = $('#markBox').children().eq(index);
    var $tables = $box.find('.compare-table').hide();
    var hasMark = false;
    for(var type in marks){
        var data = marks[type];
        if(data){
            var bol = false;
            if(data instanceof Array){
                if(data.length){
                    bol = true;
                }
            }else{
                for(var a in data){
                    bol = true;
                }
            }
            if(bol){
                var $table = $tables.filter('[type='+ type +']');
                if($table.length){
                    if(type == 'person' || type == 'vehicle'){
                        var html = '';
                        data.length > 1 && data.forEach(function(item,index){
                            var name = type == 'person' ? '人' : '车';
                            name += index + 1;
                            html += '<span class="mark-nav-item '+ (index == 0 ? 'active' : '') +'" onclick="tabMark(this)">'+ name +'</span>';
                        });
                        $table.find('.mark-nav').html(html)
//						$table.find('.mark-nav').html(html).children().eq(0).trigger('click');
                        data = data[0];
                    }

                    var target = {};
                    for(var d in data){
                        target[d.split('_')[0]] = data[d];
                    }
                    var eles = $table[0].querySelectorAll('.form-value');
                    wt.formData({
                        list:eles,
                        field:'vtext',
                        data:target
                    });
                    $table.show();
                    hasMark = true;
                }
            }
        }
    }
    $box.children().hide().eq(hasMark ? 1 : 0).show();
}
//更新研判信息
function updateYpInfo(data,index){
    var $box = $('#ypBox').children().eq(index);
    var eles = $box[0].querySelectorAll('.form-value');
    wt.formData({
        list:eles,
        field:'vtext',
        data:data
    });
}

/**
 * 多人和多车切换方法
 */
function tabMark(ele){
    var $ele = $(ele);
    if(!$ele.hasClass('active')){
        var $table = $ele.closest('.compare-table');
        var type = $table.attr('type');
        var index = $table.parent().parent().index();		//当前是左边还是右边
        var $fjItem = $('#targetBox').children(':eq('+ index +')');
        var $list = $fjItem.find('.fj-list');
        var rows = $list.data('data');
        var row = rows[$list.children('.active').index()];
        var eleIndex = $ele.index();
        var data = row.mark[type][eleIndex];
        var target = {};
        for(var d in data){
            target[d.split('_')[0]] = data[d];
        }
        var eles = $table[0].querySelectorAll('.form-value');
        wt.formData({
            list:eles,
            field:'vtext',
            data:target
        });
        $ele.addClass('active').siblings().removeClass('active');

        if(type == 'vehicle'){

        }
        var $div = $fjItem.find('.view-target');
        var echartType = 'line';
        if(type == 'person'){
            echartType = 'ellipse';
        }else if(type == 'vehicle'){
            echartType = 'rect';
        }
        changeEchartActive($div,echartType,eleIndex);
    }
}

function changeEchartActive($div,type,index){
    if(type == 'rect'){
        $div.find('.img-rect').each(function(i,item){
            if(i == index){
                $(item).addClass('active');
            }else{
                $(item).removeClass('active');
            }
        });
    }else{
        var func = type == 'ellipse' ? drawEllipseFunc : drawLineFunc;
        $div.find('.img-line[type='+ type +']').each(function(i,item){
            if(i == index){
                func({color:'red'},$(item));
            }else{
                func({color:'#0993D5'},$(item));
            }
        });
    }
}


//初始化下拉案件列表
function initDropdown(){
    $.ajax({
        url:'json/getCaseName.json',
        data:{
            caseIds:caseIds
        },
        success:function(result){
            var html = '';
            if(result && result.rows){
                result.rows.forEach(function(caseInfo,i){
                    html += '<li class="case-text" rowIndex="'+ i +'">'+ caseInfo.CASENAME +'</li>';
                });
                $('.case-list').html(html);
            }else{
                $.dlg.alertInfo('获取案件名失败！');
            }
        }
    });
}

//改变下拉案件列表显示
function changeDropdown(){
    var ary = [];
    $('#baseInfo').children().each(function(index,item){
        ary.push(item.getAttribute('rowIndex'));
    });
    $('.case-list').each(function(index,list){
        $(list).children().each(function(i,item){
            var $item = $(item);
            var index = $item.attr('rowIndex');
            if(ary.indexOf(index) != -1){
                $item.removeClass('active');
            }else{
                $item.addClass('active');
            }
        });
    });
}


//加入串并方法
function addToCB(ele){
    var $item = $(ele).closest('.case-item');
    var rowIndex = $item.attr('rowIndex');
    if(typeof rowIndex == 'undefined'){
        $.dlg.alertInfo('当前列表并无案件！');
        return;
    }
    var row = dataList[rowIndex].result.caseInfo;
//	if(row.CASEMERGEDEALSTATUS && row.CASEMERGEDEALSTATUS != 0 && row.CASEMERGEDEALSTATUS != 11){
//		$.dlg.alertInfo('该案件已串并，不能添加到串并列表！');
//		return;
//	}
    cbObj.addRow(row);
}


//数据格式化
function filterLongitude(v){
    v = isNaN(+v) ? 0 : +v;
    return v / 1000000 + '，';
}
function filterLatitude(v){
    v = isNaN(+v) ? 0 : +v;
    return v / 1000000;
}
function filterInfopoint(v){
    v = v || '';
    var vs = v.split(',');
    var result = [];
    var ary = ['','换衣服','打手机','吐痰','扔烟头','扔其他物品','卖赃物','买东西','取款','乘换交通工具','躲探头','与路人交谈'];
    vs.forEach(function(item){
        result.push(ary[item] || '');
    });
    return result.join(',');
}
function filterLocationpoint(v){
    var ary = ['','旅馆','网吧','洗浴场所','小区'];
    return ary[v] || '';
}
function filterOvertimepoint(v){
    v = '' + v;
    while(v.length < 4){
        v = '0' + v;
    }
    var hour = v.substring(0, 2);
    var minute = v.substring(2);
    return '与上一个探头超时' + hour + '时' + minute + '分';
}

/*全屏*/
function openFull(){
    $('#fullWrap').show();
    $('#fullBox').append($('#targetBox').children());

    $('.view-target').each(function(index,item){
        var $item = $(item);
        $item.css({
            left:0,
            top:0,
            width:'100%',
            height:'100%'
        });
        redraw($item);
    });
}

function hideFull(){
    $('#fullWrap').hide();
    $('#targetBox').append($('#fullBox').children());
    $('.view-target').each(function(index,item){
        var $item = $(item);
        $item.css({
            left:0,
            top:0,
            width:'100%',
            height:'100%'
        });
        redraw($item);
    });
}


//初始化图片缩放跟拖拽事件
function initDragZoomEvent(){
    $('.view-box .imgbox').each(function(index,item){
        wt.$(item).drag().zoom();
    });
}


function filterFj(type){
    $('#targetBox').children().each(function(index,item){
        var $fjList = $(item).find('.fj-list');
        var $items = $fjList.children();
        var rows = $fjList.data('data');
        rows.forEach(function(row,index){
            var $item = $items.eq(index);
            if(type == 'all'){
                $item.show();
            }else{
                var v = row[type];
                if(v && v.length){
                    $item.show();
                }else{
                    $item.hide();
                }
            }
        });
        var $act = $fjList.children('.active');
        if($act.length){
            if($act.is(':hidden')){
                $act.removeClass('active');
                var $first = $fjList.children(':visible').first();
                if($first.length){
                    $first.trigger('click');
                }else{
                    clearInfo(index);
                }
            }
        }else{
            var $first = $fjList.children(':visible').first();
            if($first.length){
                $first.trigger('click');
            }else{
                clearInfo(index);
            }
        }


    })
}


function clearInfo(index){
    var $imgBox = $('#targetBox').children().eq(index).find('.view-target');
    $imgBox.show().next().hide();
    $imgBox.find('.img-rect').remove();
    $imgBox.find('.img-line').remove();
    $imgBox.children('img').attr('src',errorSrc);
    updateMark({},index);
}

function showLoading(){
    $('#loadingBox').show();
}
function hideLoading(){
    $('#loadingBox').hide();
}

/**
 * 统计研判信息
 */
function getYpInfo(data){
    var rows = data.result.picture || [];
    var caseInfo = data.result.caseInfo;
    var gcRows = [];
    var personRows = [];
    rows.forEach(function(row,i){
        var typeCode = row.TYPECODE;
        if(typeCode && typeCode.indexOf('7') != -1){
            gcRows.push(row);
        }else if(typeCode && typeCode.indexOf('1') != -1){
            personRows.push(row);
        }
    });
    var infoPoint = [];
    var overtimePoint = [];
    var locationPoint = [];
    var locationaddr = [];
    var judgeinfo = [];
    var trajectoryCount = 0;
    gcRows.forEach(function(row){
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

    var str = '';
    var manCount = 0;
    var womanCount = 0;
    var count = 0;

    var personNameAry = [];

    personRows.forEach(function(row){
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
    });

    str = count + ' 人，' + manCount + ' 男 ' + womanCount + ' 女 ';
    if(count - manCount - womanCount > 0){
        str += count - manCount - womanCount + ' 未知';
    }

    var shInfo = data.shInfo || {};
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
        DEALSTATUS:caseInfo.DEALSTATUS,
        ENDTIMEVALUE:shInfo.ENDTIMEVALUE,
        USERNAME:shInfo.USERNAME,
        MEMO:caseInfo.MEMO,
        PARENTCATEGORIES:caseInfo.CHILDCATEGORIES || caseInfo.PARENTCATEGORIES,
//			MEMO_ellipsis:limitBytes(caseInfo.MEMO,55,150),
        CNT:caseInfo.CNT,
//			CNT_ellipsis:limitBytes(caseInfo.CNT,55,150)
    };
    for(var name in data){
        var func = filterValueMethods[name];
        if(typeof func == 'function'){
            data[name] = func(data[name]);
        }
    }
    return data;
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
    },
    //审核状态
    DEALSTATUS:function(v){
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
}


/**
 * 显示图层
 */
function showLayers(ele){
    var $ele = $(ele);
    var $target = $('#targetBox');
    if($target.hasClass('hide-layers')){
        $target.removeClass('hide-layers');
        $('#fullWrap').removeClass('hide-layers');
        $ele.html('隐藏图层');
    }else{
        $target.addClass('hide-layers');
        $('#fullWrap').addClass('hide-layers');
        $ele.html('显示图层');
    }
}

function openDetailByImg(img){
    var $item = $(img).closest('.case-item');
    var index = $item.attr('rowIndex');
    var caseId = dataList[index].caseId;
    window.open(pathname + '/liveyc/caseJudge/caseInfo.jsp?caseId=' + caseId);
}

/**
 * 截取最大字节数的字符串，根据剩余字符添加省略号
 * @param lineBytes     每行的字节数，用于指定换行符对应多少字符
 * @param max   最大字节数
 * @param bol   是否添加省略号
 * @returns {string}
 */
var doubleByteRe = /[^\x00-\xff]/;      //匹配双字节正则
function limitBytes(str,lineBytes,max,bol){
    if(!str){
        return '';
    }
    var count = 0;
    var len = str.length;
    for(var i = 0;i < len;i++){
        var char = str.charAt(i);
        if(char == '\n'){
            count = (Math.floor(count / lineBytes) + 1) * lineBytes;
        }else if(doubleByteRe.test(char)){
            count += 2;
        }else{
            count++;
        }
        if(count >= max){
            str = str.substr(0,i) + (typeof bol == 'boolean' ? bol ? '...' : '' : '...');
            break;
        }
    }
    return str.replace(/\s?\n\s?/g,'<br>');
}

function getAllCaseIds(){
    var ary = [];
    var temp = caseIds.split(',');
    $('.case-list').first().children().each(function(i,item){
        var index = $(item).attr('rowIndex');
        temp[index] && ary.push(temp[index]);
    });
    return ary.join(',');
}


function openCB(){
    var casetypes = [];
    var caseareas = [];
    for(var i = 0,len=dataList.length;i < len;i++){
        var row = dataList[i];
        if(row.result && row.result.caseInfo){
            var info = row.result.caseInfo;
            var type = info.CHILDCATEGORIES || info.PARENTCATEGORIES;
            var casearea = info.CASEAREA;
            if(type && $.inArray(type,casetypes)<0){
                casetypes.push(type);
            }
            if(casearea && $.inArray(casearea,caseareas)<0){
                caseareas.push(casearea);
            }
        }
    }
    var title = "";
    if(caseareas.length > 0 || casetypes.length > 0){
        title = caseareas.join("、")+casetypes.join("、")+"系列案件";
        title =  encodeURIComponent(encodeURIComponent(title));
    }
    var url = pathname + '/liveyc/seriesAndParallel/jsp/caseMerger.jsp?sq=1&mergeState=0&caseIds=' + getAllCaseIds()+"&title="+title;
    window.open(url);
}

function loadNextCase(ele){
    var $act = $(ele).closest('.case-item').find('.change-menu .active').first();
    if($act.length){
        $act.click();
    }
}

function removeCaseByBtn(ele){
    var $item = $(ele).closest('.case-item');
    var i = $item.attr('rowIndex');
    if(i != null){
        removeCase(i);
        var $acts = $item.find('.case-list .active');
        if($acts.length){
            $acts.first().click();
        }else{
            clearView($item.index());
        }
    }

}

function removeCase(i){
    if(dataList[i].caseId){
        dataList[i] = {};
        $('.case-list').each(function(index,list){
            $(list).find('[rowIndex='+ i +']').remove();
        });
    }
}

function clearView(index){
    loadBaseInfo({},index);
    loadFJList([],index);
    $('#baseInfo').children().eq(index).removeAttr('rowIndex');
    updateYpInfo({},index);
    updateMapAddr();
    updateMark({},index);
    var $item = $('#targetBox').children().eq(index);
    playVideo(false,$item.find('.video-box'));
    $item.find('.view-img').remove();
}
