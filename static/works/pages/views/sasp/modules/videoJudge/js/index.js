/**
 * Created by Administrator on 2018/2/28.
 */


var dataList = [];
var caseIndex = 0;
var pathname = location.protocol+'//'+location.host+'/'+location.pathname.split('/')[1];
var isIE8 = false;
var caseIds = '1161126';

var flag = true;
$(function(){
    initType();
    initEvent();
    initDragEvent();
    initData();
});

//判断页面类型
function initType(){
}

//获取数据并初始化页面
function initData(){
    $.ajax({
        url:'json/getCaseMaterialList.json',
        data:{
            caseId : caseIds
        },
        success:function(data){
            if(data){
                dataList = data;
                addTypeForFj(data);
                initCaseList();
                initScreen(data.length);
            }else{
                promptWindow('信息获取失败，请刷新重试！');
            }
        },
        error:function(e){

        }
    });
}

//添加类型处理
function addTypeForFj(data){
    data.forEach(function(item,index){
        var picture = item.result.picture || [];
        var types = item.result.type || {};
        picture.forEach(function(item,index){
            var obj = {};
            var isWfl = true;
            for(var type in types){
                if(types.hasOwnProperty(type)){
                    var ids = types[type];
                    if(ids.indexOf(item.MATERIALID) != -1){
                        obj[type] = 1;
                        isWfl = false;
                    }
                }
            }
            if(isWfl){
                obj['wfl'] = 1;
            }
            item.type = obj;
        });
    });
}

//添加未分类图片数据
function addNotype(rows){
    rows.forEach(function(caseRow,index){
        var result = caseRow.result;
        var pics = result.picture || [];
        var typeOpt = result.type || {};
        var typeAry = [];
        for(var name in typeOpt){
            if(typeOpt[name]){
                typeAry.push(typeOpt[name]);
            }
        }
        var typeStr = typeAry.join('$');

        var ary = [];
        pics.forEach(function(item,index){
            if(typeStr.indexOf(item.MATERIALID) == -1){
                ary.push(item.MATERIALID);
            }
        });
        result.type.wfl = ary.join('$');
    });
}
var playingMid = '';//正在播放的视频的materialId
var playingCid = '';//正在播放的视频的caseId
//初始化事件
function initEvent(){
    $('#caseList').children('.w-combo-list').click(function(ev){
        var e = ev || event;
        if(e.stopPropagation){
            e.stopPropagation();
        }else{
            e.cancelBubble = true;
        }

        var target = e.target || e.srcElement;
        var $target = $(target);
        if($target.parent().hasClass('w-combo-item')){
            $target = $target.parent();
        }
        if($target.hasClass('w-combo-item')){
            if($target.hasClass('active')){
                $target.removeClass('active');
                $target.children()[0].checked = false;
            }else{
                $target.addClass('active');
                $target.children()[0].checked = true;
            }
            var $this = $(this);
            var textAry = [];
            $this.children('.active').each(function(index,item){
                textAry.push(item.children[1].innerHTML);
            });
            $this.prev().prev().val(textAry.join(','));
            updateCount();
            filterPic();
        }
    });
    $('#imgList').click(function(ev){
        var e = ev || event;
        var target = e.target || e.srcElement;
        var $item = $(target).closest('.img-item');
        if($item.length){
            var $imgView = $('#imgWrap');
            var rowIndex = $item.attr('index');
            var data = getDataByItem($item);
            var caseRow = data.result;
            var row = caseRow.picture[$item.index()];
            var $act = $('#imgWrap').children().eq(rowIndex > 3 ? 3 : rowIndex);
            $imgView.show().siblings().hide();
            bindLink($item,$act,caseRow);
            playVideo(false);
            $('#imgSplit').show();
            $('#viewType').hide();
        }
    });
    $('#imgSplit').children().click(function(){
        var $this = $(this);
        if($this.hasClass('active')){
            return;
        }
        var $box = $('#imgWrap');
        addActive($this,true);
        var index = $this.index();
        var classAry = ['','screen2-box','screen4-box'];
        classAry.forEach(function(item,i){
            if(index == i){
                $box.addClass(item);
            }else{
                $box.removeClass(item);
            }
        });
        var $items = $box.children();
        var $imgActIndex = $box.find('.active').parent().index();
        if(index == 0 && $imgActIndex != 0){
            $items.eq(0).children().trigger('click');
        }else if(index == 1 && $imgActIndex > 1){
            $items.eq(0).children().trigger('click');
        }
        setOriginImgSize();
        initImg();
    }).first().trigger('click');
    $('#viewType').children().click(function(){
        var $this = $(this);
        if(!$this.hasClass('active')){
            var num = $this.attr('value');
            setTimeout(function(){
                $('#player')[0].SetAttribute("LYPLAYEROCX_SET_PLAYER_NUM", num);
                $this.addClass('active').siblings().removeClass('active');
            },30);
        }
    });

    //收缩左右列表功能
    $('.col-btn').click(function(){
        var $this = $(this);
        if($this.hasClass('disabled')){
            return;
        }
        $this.addClass('disabled');
        var $right = $this.parent().parent();
        var isLeft = $this.attr('type') == 'left';
        var cPdr = parseInt($right.css('paddingRight'));
        var cMgr = parseInt($right.css('marginRight'));
        var width;
        var title = isLeft ? '左侧列表' : '右侧信息';

        var dw = isLeft ? 295 : 305;

        if($this.hasClass('coled')){
            $this.removeClass('coled');
            cPdr += dw;
            cMgr -= dw;
            width = dw;
            title = '收缩' + title;
        }else{
            $this.addClass('coled');
            cPdr -= dw;
            cMgr += dw;
            width = 0;
            title = '展开' + title;
        }

        if(isLeft){
            $right.prev().stop().animate({
                width:width
            },300);
        }else{
            $right.next().stop().animate({
                width:width
            },300);
            var bzTitle = '显示标签信息';
            if(!$this.hasClass('coled')){
//				bzTitle = '隐藏标签信息'
            }
            $('#imgBtnBZ').attr('title',bzTitle);
        }

        $right.animate({
            paddingRight:cPdr,
            marginRight:cMgr
        },300,function(){
            $this.attr('title',title);
            $this.removeClass('disabled');
            setOriginImgSize();
            initImg();
        });
    });

    //分类筛选
    $('#typesBox').children().click(function(ev){
        var $this = $(this);
        if(!$this.hasClass('active')){
            $this.addClass('active').siblings().removeClass('active');
            filterPic();
        }
    });
    //过程图片定位事件
    $('#gcMap').click(function(){
        var url = '/appMap/pGis/map.jsp?paramFrom=caseLinesPage&caseId=' + dataList[0].caseId;
        window.open(url,'gcMap_window');
    });

    $('#imgWrap').bind('selectstart',function(){
        return false;
    });

    /**
     * 框选的人车切换
     */
    $(".per-tab-box").delegate(".type-item",'click',function(e){
        //切换选中状态
        var $this = $(this);
        var red = {'color':'red'};
        var child = $(".per-tab-box").children();
//		if(child.length > 0){
//			for(var r=0;r<child.length;r++){
//				var opt = {'color':'#0993D5'};
//				var orginal = child[r].data;
//				if(orginal) drawEllipseFunc(opt,orginal);
//			}
//		}
        var index = $this.index();

//		$cImgBox.find('[mtype=person_'+ index +']').removeClass('echarts-hide').siblings('div').addClass('echarts-hide');

        $this.addClass('active').siblings().removeClass('active');
//		if($this[0].data) drawEllipseFunc(red,$this[0].data);
        //赋值
        var $panel = $('#panelBox');
        formData('td-value','vtext',$this[0].row,$panel.children().eq(1)[0]);
    });
    $(".veh-tab-box").delegate(".type-item",'click',function(e){
        //切换选中状态
        var $this = $(this);
        $this.addClass('active').siblings().removeClass('active');
//		$('.img-rect').addClass('img-rect-red');
//		if($this[0].data) $this[0].data.removeClass('img-rect-red');
        //赋值
        var $panel = $('#panelBox');
        formData('td-value','vtext',$this[0].row,$panel.children().eq(2)[0]);

        var index = $this.index();
        $cImgBox.find('[mtype=vehicle_'+ index +']').removeClass('echarts-hide').siblings('div').addClass('echarts-hide');

    });
    //画线切换不同线div
    $(".line-tab-box").delegate(".type-item",'click',function(e){
        //存值,存放于目标dom  row 属性中
        var row = {};
        //切换选中状态
        var $this = $(this);
        var red = {'color':'red'};
        var child = $(".line-tab-box").children();
        if(child.length > 0){
            for(var r=0;r<child.length;r++){
                var opt = {'color':'#0993D5'};
                var orginal = child[0].data;
                if(orginal) updateLineByOpt(orginal, opt);
            }
        }
        $this.addClass('active').siblings().removeClass('active');
        if($this[0].data) updateLineByOpt($this[0].data, red);
    });
    fitImgEvent();
    initImgZoom('fullImg');
    $(window).resize(setOriginImgSize);
}
/**
 * 更新类型数量
 */
function updateCount(){
    var data = countObj;
    var target = {};
    $('#caseList').find('.active').each(function(index,item){
        var count = data[item.getAttribute('caseId')] || {};
        for(var t in count){
            if(count.hasOwnProperty(t)){
                if(!target[t]){
                    target[t] = 0;
                }
                target[t] += count[t];
            }
        }
    });
    $('#typesBox').children().each(function(index,item){
        var type = item.getAttribute('value');
        var $num = $(item).children('.type-count');
        var value = target[type];
        if(value){
            $num.html(value).show();
        }else{
            $num.hide();
        }
    });

    var $gcMap = $('#gcMap');
    target.gc ? $gcMap.show() : $gcMap.hide();

}

///视频播放
function playVideo(bol,index,url){
    setTimeout(function(){
        var player = $('#player')[0];
        if(bol){
            try{
                player.SetAttribute("LYPLAYEROCX_SELECT_PLAYER", index || 1);
                player.CloseFile(1);
                player.OpenFile(url);
            }catch(e){
                wt.alert('控件播放失败！');
            }
        }else{
            try{
                for(var i = 1;i < 5;i++){
                    player.SetAttribute("LYPLAYEROCX_SELECT_PLAYER",i);
                    player.CloseFile(1);
                }
            }catch(e){
            }
        }

    },30);
}

/**
 * 添加active类
 * @param ele   元素
 * @param bol   是否删除兄弟节点的active类
 */
function addActive($ele,bol){
    $ele.addClass('active');
    if(bol){
        $ele.siblings('.active').removeClass('active');
    }
}

/**
 * 更新标注信息
 * @param ele
 */

function updateBZ(ele){
    var $box = $(ele).closest('.view-item');
    var $item =  $box.data('link');
    if(!$item){
        promptWindow('请选择图片进行查看！');
        return;
    }
    var row = getDataByItem($item).result.picture[$item.index()];
    var $btn = $('#colBtn');
    if($btn.hasClass('coled')){
        $btn.trigger('click');
    }else if($('#panelBox').data('curRow') == row){
        $btn.click();
        return;
    }
    updateBZInfo(row,$box);
}
/**
 * 填写标注内容信息
 * @param row
 * @param $box
 */
var $cImgBox = null;
function updateBZInfo(row,$box){
    var $panel = $('#panelBox');
    $panel.data('curRow',row);
    $('.w-table tr').each(function(i,tr){
        var $tr = $(tr);
        if(!$tr.hasClass('w-table-hidden')){
            $tr.find('td').hide();
        }
    });
    controlLabel(row);
    //清空数据
    $box.find('.img-rect').remove();
    $box.find('.img-line').remove();
    $('.per-tab-box').children().remove();
    $('.veh-tab-box').children().remove();
    $('.line-tab-box').children().remove();
    var $imgbox =  $box.find('.imgbox');
    $cImgBox = $imgbox;
    dealEcharts(row,$imgbox);

    //多目标人、车生成
    if(row.type && row.type.person && row.person){
        for(var i=0;i<row.person.length;i++){
            var color =  'red';// : '#0993D5';
            if(i==0){
                //默认选中第一个值
//				formData('td-value','vtext',row.person[i],$panel.children().eq(1)[0]);
            }
            //画图并创建嫌疑人div，绑定row到div中，便于切换div
            var $div = null;
            var data = row.person[i];
//			if(data.LEFTTOPX && data.LEFTTOPX!='0'){
            var innerWidth = $imgbox.width();
            var innerHeight = $imgbox.height();
            var LEFTTOPX = data.LEFTTOPX;
            var LEFTTOPY = data.LEFTTOPY;
            var RIGHTBTMX = data.RIGHTBTMX;
            var RIGHTBTMY = data.RIGHTBTMY;
            var opt = {
                x1:+LEFTTOPX*innerWidth,
                y1:+LEFTTOPY*innerHeight,
                x2:+RIGHTBTMX*innerWidth,
                y2:+RIGHTBTMY*innerHeight,
                color:color
            }
//			$div = drawEllipseFunc(opt,null,$imgbox);
//			}
            fillMutilLabel("person",$div,row.person[i]);
        }
    }
    if(row.type && row.type.vehicle && row.vehicle){
        for(var i=0;i<row.vehicle.length;i++){
            if(i==0){
                //默认选中第一个值
//				formData('td-value','vtext',row.vehicle[i],$panel.children().eq(1)[0]);
            }
            //画图并创建嫌疑人div，绑定row到div中，便于切换div
            var $div = null;
            var data = row.vehicle[i];
            var LEFTTOPX = data.LEFTTOPX;
            var LEFTTOPY = data.LEFTTOPY;
            var RIGHTBTMX = data.RIGHTBTMX;
            var RIGHTBTMY = data.RIGHTBTMY;
//			$div = drawRectLayer($imgbox,LEFTTOPX,LEFTTOPY,RIGHTBTMX,RIGHTBTMY);
            fillMutilLabel("vehicle",$div,row.vehicle[i]);
        }
    }
    //过程图片
    if(row.type && row.type.gc){
        formData('td-value','vtext',row,$panel.children().eq(0)[0]);
        formData('td-value','vtext',row,$panel.children().eq(3)[0]);
        var $imgbox =  $box.find('.imgbox');
        //画图并创建嫌疑人div，绑定row到div中，便于切换div
        var $div = null;
//		if(row.LINELOCATION){
//			drawLineGc(row.LINELOCATION,$imgbox);
//		}
    }

    checkHideBzTitle();

}


function checkHideBzTitle(){
    $('#panelBox').children().each(function(i,panel){
        var $panel = $(panel);
        var $title = $panel.find('.bz-title').hide();
        var $tds = $panel.find('td');
        for(var i = 0,len = $tds.length;i < len;i++){
            var $td = $tds.eq(i);
            if(!$td.parent().hasClass('w-table-hidden') && $td.is(':visible')){
                $title.show();
                return;
            }
        }
    });
}


/**
 * 画线功能
 */
function drawLineGc(lineLocation,$imgbox){
    if(lineLocation.length == 0){
        return;
    }
    var lines = lineLocation.split('$');
    var innerWidth = $imgbox.width();
    var innerHeight = $imgbox.height();
    for(var i=0;i<lines.length;i++){
        var color = 'red' ;//: '#0993D5';
        var line = lines[i].split(',');
        var opt = {
            x1:+line[0]*innerWidth,
            y1:+line[1]*innerHeight,
            x2:+line[2]*innerWidth,
            y2:+line[3]*innerHeight,
            color:color
        }
        var $div = drawLineFunc(opt,null,$imgbox);
        newLine(line[0],line[1],line[2],line[3],$div);
    }
}
/**
 * 过程图片画线
 * @param x1 左上角x
 * @param y1 左上角y
 * @param x2 右下角x
 * @param y2 右下角y
 * @param $div 画框对象
 */
function newLine(x1,y1,x2,y2,$div){
    var index = $('#imgList').find('.active').index();
    var data = {};
    data.LEFTTOPX = x1;
    data.LEFTTOPY = y1;
    data.RIGHTBTMX = x2;
    data.RIGHTBTMY = y2;
    fillMutilLine([data],index,$div);
}
/**
 * 控制tab页的显示
 * @param row
 */
function controlLabel(row){
    $('#navBox').children().hide();
    $('#panelBox').children().removeClass('active');
    if(row.type){
        if(row.type.vehicle){
            $($('#navBox').children()[2]).show();
            $($('#panelBox').children()[2]).addClass('active');
        }
        if(row.type.person){
            $($('#navBox').children()[1]).show();
            $($('#panelBox').children()[1]).addClass('active');
        }
        if(row.type.gc){
            $($('#navBox').children()[0]).show();
            $($('#panelBox').children()[0]).addClass('active');
            $($('#navBox').children()[3]).show();
            $($('#panelBox').children()[3]).addClass('active');
        }
    }
    if($('#navBox').children(":visible:first").length > 0)
        $('#navBox').children(":visible:first").trigger('click');
}
/**
 * 将画框div绑定到按钮中去
 */
function bindDrawBtn(data){
    if(data.vehicle){
        $('.veh-tab-box').show();
        $('.veh-tab-box')[0].data = data.vehicle;
    }else{
        $('.veh-tab-box').hide();
    }
    if(data.person){
        $('.per-tab-box').show();
        $('.per-tab-box')[0].data = data.person;
    }else{
        $('.per-tab-box').hide();
    }
}
/**
 * 显示关闭框选对象
 * @param type  1：人  2：车
 */
function showRect(type,that){
    $(that).removeClass('active').siblings().addClass('active');
    if(type == 1){
        if($('.per-tab-box')[0].data) $('.per-tab-box')[0].data.show();
    }
    if(type == 2){
        if($('.veh-tab-box')[0].data) $('.veh-tab-box')[0].data.show();
    }
}
/**
 * 关闭框选对象
 * @param type  1：人  2：车
 */
function hideRect(type,that){
    $(that).removeClass('active').siblings().addClass('active');
    if(type == 1){
        if($('.per-tab-box')[0].data) $('.per-tab-box')[0].data.hide();
    }
    if(type == 2){
        if($('.veh-tab-box')[0].data) $('.veh-tab-box')[0].data.hide();
    }
}
/**
 * 画框
 */
function drawRectLayer($box,x1,y1,x2,y2){
    var $div = $('<div class="img-rect"></div>');
    var imgWidth = $box.width();
    var imgHeight = $box.height();
    var width = (x2 - x1) * imgWidth;
    var height = (y2 - y1) * imgHeight;
    var posLeft = x1 * imgWidth;
    var posTop = y1 * imgHeight;
    $div.css({
        left:x1 * 100 + '%',
        top:y1 * 100 + '%',
        width:(x2 - x1) * 100 + '%',
        height:(y2 - y1) * 100 + '%'
    });
    $box.append($div);
    return $div;
}

//改变图片列表中中的图片大小
function changeImgSize(ele){
    var $ele = $(ele);
    if(!$ele.hasClass('active')){
        $ele.addClass('active').siblings('.active').removeClass('active');
        var index = $ele.index();
        var $box = $('#imgList');
        if(index){
            $box.removeClass('imglist-s');
        }else{
            $box.addClass('imglist-s');
        }
    }
}

//给展示图片添加缩放事件
function fitImgEvent(){
    $('#imgWrap').find('.imgbox').each(function(index,item){
        initImgZoom(item);
    });
}

//添加active，bol表示是否删除其他元素的active
function addActive($ele,bol){
    $ele.addClass('active');
    if(bol){
        $ele.siblings().removeClass('active');
    }
}

//设置原始图片大小
function setOriginImgSize(){
    var $wrap = $('#imgWrap');
    if($wrap.is(':visible')){
        var $imgBox = $wrap.find('.view-imgbox').first();
        var d = 10;
        var maxH = $imgBox.height() - d;
        var maxW = $imgBox.width() - d;
        var w,h;
        if(maxW / maxH > 4 / 3){
            h = maxH;
            w = maxH / 3 * 4;
        }else{
            w = maxW;
            h = maxW / 4 * 3;
        }
        $wrap.data('originCss',{
            width:w + 'px',
            height:h + 'px',
            left:(maxW + d - w)/2 + 'px',
            top:(maxH + d - h)/2 + 'px'
        });
    }
}

//重置图片大小
function resizeImg(ele){
    var $wrap = $('#imgWrap');
    var $ele = ele ? $(ele).parent().prev().find('.imgbox') : $wrap.find('.active .imgbox');
    $ele.css($wrap.data('originCss'));
    $('.img-line').each(function(index,item){
        var $item = $(item);
        var type = $item.attr('type');
        if(type == 'line'){
            drawLineFunc({},$item);
        }else{
            drawEllipseFunc({},$item);
        }
    });
}
//初始化各图片大小
function initImg(){
    var $wrap = $('#imgWrap');
    $wrap.find('.imgbox').css($wrap.data('originCss'));
    redraw();
}

function initImgZoom(img){
    if(typeof img == 'string'){
        img = document.getElementById(img);
    }
    if(img.addEventListener){
        img.addEventListener('wheel',wheel);
    }else{
        img.attachEvent('onmousewheel',mousewheel);
    }
    $(img).bind('mousedown',mousedown);
    img.ondragstart = function(){
        return false;
    }
}

function wheel(ev){
    var e = ev || event;
    var rect = this.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    zoomImg({x:x,y:y},this,e.deltaY < 0);
    if(e.preventDefault){
        e.preventDefault();
    }else{
        e.returnValue = false;
    }
}
function mousewheel(ev){
    var e = ev || event;
    var target = e.srcElement || e.target;
    if($(target).parent().hasClass('imgbox')){
        target = target.parentNode;
    }
    var rect = target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    zoomImg({x:e.offsetX,y:e.offsetY},target,e.wheelDelta > 0);
    if(e.preventDefault){
        e.preventDefault();
    }else{
        e.returnValue = false;
    }
}
function mousedown(ev){
    var e = ev || event;
    var rect = this.parentNode.getBoundingClientRect();
    var imgRect = this.getBoundingClientRect();
    var $this = $(this);
    var dy = e.clientY - imgRect.top;
    var dx = e.clientX - imgRect.left;
    var func = function(ev){
        var e = ev || event;
        var y = e.clientY - rect.top - dy;
        var x = e.clientX - rect.left - dx;
        $this.css({
            top:y + 'px',
            left:x + 'px'
        });
    };

    var $doc = $(document);
    $doc.bind('mousemove',func);
    $doc.bind('mouseup',function(){
        $doc.unbind('mousemove',func);
        $doc.unbind('mouseup',arguments.caller);
    });
    if(e.preventDefault){
        e.preventDefault();
    }else{
        e.returnValue = false;
        return false;
    }
}


//初始化案件列表
function initCaseList(){
    var html = '';
    dataList.forEach(function(item,index){
        var caseInfo = item.result.caseInfo;
        var bol = index != 0;
        html += '<div class="w-combo-item '+ (bol ? 'active' : '') +'" caseId="'+ caseInfo.CASEID +'" title="'+ caseInfo.CASENAME +'"><input type="checkbox" class="w-combo-checkbox" '+ (bol ? 'checked' : '') +'><span class="w-combo-text">'+ caseInfo.CASENAME +'</span></div>';
    });
    var $caseList = $('#caseList');
    $caseList.children().last().html(html);
    if(dataList.length > 1){
        $caseList.show();
    }else{
        var name = dataList[0].result.caseInfo.CASENAME;
        $('#casename').html(name).attr('title',name).show();
    }

    setTimeout(function(){
        $('#caseList').find('.w-combo-item').first().trigger('click');
    },0);

    initImgList();
    initVideoList();
}

var countObj = {};
//初始化案件列表
function initImgList(){
    var html = '';
    var rows = [];
    dataList.forEach(function(item,index){
        var picture = item.result.picture || [];
        var count = {all:0};
        picture.forEach(function(item){
            html += '<div class="img-item" index="'+ index +'" materialid="'+ item.MATERIALID +'" style="display:none"><div class="img-imgbox">'
                +'<img class="item-img" dsrc="'+ getImgSrc(item) +'"><span class="loading-icon"></span></div><div class="img-text" title="'
                + item.FILENAME + '">'
                + item.FILENAME + '</div></div>';

            var type = item.type || {};
            var bol = true;
            for(var t in type){
                if(type.hasOwnProperty(t)){
                    bol = false;
                    if(count[t]){
                        count[t]++;
                    }else{
                        count[t] = 1;
                    }
                }
            }
            if(bol){
                if(count['wfl']){
                    count['wfl']++;
                }else{
                    count['wfl'] = 1;
                }
            }
            count.all++;
            rows.push(item);
        });
        countObj[item.caseId] = count;
    });
    var $htmls = $(html);
    $('#imgList').html($htmls).data('data',rows);

    $htmls.find('.item-img').each(function(index,item){
        cacheImgList.push(item);
    });
    renderImg();
    updateCount();
}

//初始化视频列表
function initVideoList(){
    var html = '';
    var ary = [];
    dataList.forEach(function(caseRow,index){
        var rows = caseRow.result.video || [];
        rows.forEach(function(row,index){
            html += '<div class="video-item" caseId="'+ caseRow.caseId +'">'
                +'<div class="video-imgbox">'
                +'<img class="item-img" dsrc="'+ getImgSrc(row) +'"><div class="video-label">'
                +'<div class="label-text b1" onclick="play(this,arguments[0])">窗口1</div>'
                +'<div class="label-text b2" onclick="play(this,arguments[0])">窗口2</div>'
                +'<div class="label-text" onclick="play(this,arguments[0])">窗口3</div>'
                +'<div class="label-text b4" onclick="play(this,arguments[0])">窗口4</div>'
                +'<div class="label-bg fit"></div></div></div><p class="item-text" title="'
                + row.FILENAME + '"><span class="hand-text" title="点击下载视频" onclick="downloadVideo(this)">'
                + row.FILENAME + '</span></p></div>';
            ary.push(row);
        });
    });
    var $html = $(html);
    $('#videoList').html($html).data('data',ary);
    $html.find('.item-img').each(function(index,item){
        cacheImgList.push(item);
    });
    renderImg();
}

function initScreen(num){
    if(num == 2){
        $('#imgSplit').children().eq(1).trigger('click');
    }else if(num > 2){
        $('#imgSplit').children().eq(2).trigger('click');
    }
}
/**
 * 收缩图片列表
 */
function colImgList(ele){
    var $ele = $(ele);
    if($ele.hasClass('col-disabled')){
        return;
    }
    $ele.addClass('col-disabled');
    var $target = $ele.parent().next();
    var h;
    if($ele.hasClass('coled')){
        h = $target.children()[0].offsetHeight;
        $ele.removeClass('coled');
    }else{
        h = 0;
        $ele.addClass('coled');
    }
    $target.animate({
        height:h
    },300,function(){
        $ele.removeClass('col-disabled');
    })
}

function filterPic(){
    var caseIdAry = [];
    $('#caseList').find('.active').each(function(index,item){
        caseIdAry.push(item.getAttribute('caseId'));
    });
    var typeAry = [];
    $('#typesBox').children('.active').each(function(index,item){
        typeAry.push(item.getAttribute('value'));
    });

    var $imgList = $('#imgList');
    var rows = $imgList.data('data');
    var $items = $imgList.children().hide();
    var mId = getQueryString('mId') || '';
    var currentIndex = 0;


    var defaultViewAry = [];

    rows.forEach(function(row,index){
        if(caseIdAry.indexOf(row.CASEID) != -1){
            if(typeAry.indexOf('all') != -1){
                var $item = $items.eq(index).show();
                var i = $item.attr('index');
                if(!defaultViewAry[i]){
                    defaultViewAry[i] = $item;
                }
            }else{
                var type = row.type || {};
                typeAry.forEach(function(t){
                    if(type[t]){
                        var $item = $items.eq(index).show();
                        var i = $item.attr('index');
                        if(!defaultViewAry[i]){
                            defaultViewAry[i] = $item;
                        }
                    }
                });
            }
        }
        if(row.MATERIALID == mId){
            var $item = $items.eq(index);
            if($item.is(':visible')){
                var i = $item.attr('index');
                defaultViewAry[i] = $item;
            }
        }
    });

    var $videoList = $('#videoList');
    var videoRows = $imgList.data('data');
    var $videoItems = $videoList.children().hide();

    videoRows.forEach(function(item,index){
        if(caseIdAry.indexOf(item.CASEID) != -1){
            $videoItems.eq(index).show();
        }
    });


    var $viewBoxs = $('#imgWrap').children();
    var count = 0;

    for(var i = 0;i < defaultViewAry.length && count < 4;i++){
        var $target = defaultViewAry[i];
        if($target){
            bindLink($target,$viewBoxs.eq(count++));
        }
    }
    for(var i = count;i < 4;i++){
        bindLink(null,$viewBoxs.eq(i));
    }
}

//初始化图片拖拽事件
function initDragEvent(){
    $('#imgList').mousedown(function(ev){
        var e = ev || event;
        var target = e.target || e.srcElement;
        var $ele = $(target).closest('.img-imgbox');
        if(!$ele.length){
            return;
        }
        var ary = [];
        $('#imgWrap').find('.view-imgbox').each(function(index,item){
            ary[index] = {
                target:$(item),
                rect:item.getBoundingClientRect()
            }
        });

        var $div = $ele.clone();
        $div.css({
            position:'absolute',
            width:$ele.width() + 'px',
            height:$ele.height() + 'px',
            left:$ele.offset().left + 'px',
            top:$ele.offset().top + 'px'
        });
        $('body').append($div);

        var dy = e.offsetY;
        var dx = e.offsetX;
        var ox = e.clientX;
        var oy = e.clientY;
        var isClick = true;
        var func = function(ev){
            var e = ev || event;
            var cx = e.clientX;
            var cy = e.clientY;
            var y = cy - dy;
            var x = cx - dx;
            // 判断是否开始移动
            if (isClick) {
                if (Math.abs(cx - ox) < 10
                    && Math.abs(cy - oy) < 10) {
                    return;
                }
                isClick = false;
            }

            $div.css({
                top:y + 'px',
                left:x + 'px'
            });
        };
        var mouseupFunc = function(ev){
            if(isClick){
                $ele.parent().trigger('click');
            }else{
                var e = ev || event;
                var img = e.target || e.srcElement;
                var x = e.clientX;
                var y = e.clientY;

                var $filter = ary.filter(function(item,index){
                    var rect = item.rect;
                    return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
                });

                if($filter.length){
                    bindLink($ele.closest('.img-item'),$filter[0].target.parent().parent());
                }
            }
            $doc.unbind('mousemove',func);
            $doc.unbind('mouseup',mouseupFunc);
            $div.remove();
        }

        var $doc = $(document);
        $doc.bind('mousemove',func);
        $doc.bind('mouseup',mouseupFunc);
        if(e.preventDefault){
            e.preventDefault();
        }else{
            e.returnValue = false;
            return false;
        }
    }).bind('dragstart',function(){
        return false;
    });
}

function addClassActive($ele,bol){
    $ele.addClass('active');
    if(bol){
        $ele.siblings('.active').removeClass('active');
    }
}


//上一张下一张移动方法
function moveImg(ele,isRight){
    var $box = $(ele).closest('.view-item');
    var $item = $box.data('link');
    if(!$item){
        promptWindow('请先选择图片进行查看！');
        return;
    }
    var func = isRight ? 'next' : 'prev';
    var msg = isRight ? '当前是最后一张！' : '当前是第一张！';
    var $target = $item[func]();
    while($target.length && $target.is(':hidden')){
        $target = $target[func]();
    }
    if($target.length){
//		$target.trigger('click');
        bindLink($target, $box);
    }else{
        promptWindow(msg);
    }
}

//缩放图片方法
function zoomFunc(ele,isEnlarge){
    var img = $(ele).parent().prev().find('.view-img')[0];
    zoomImg({
        x:img.offsetWidth/2,
        y:img.offsetHeight/2
    },img,isEnlarge);
}
function zoomImg(offset,img,isEnlarge){
    var w = img.offsetWidth;
    var h = img.offsetHeight;
    var scale = 1.2;
    var width,height;
    if(isEnlarge){
        width = w * scale;
        height = h * scale;
    }else{
        width = w / scale;
        height = h / scale;
    }
    $(img).css({
        width:width + 'px',
        height:height + 'px',
        left:img.offsetLeft + offset.x - offset.x / w * width + 'px',
        top:img.offsetTop + offset.y - offset.y / h * height + 'px'
    });
    redraw();
}

function redraw(){
    $('.img-line').each(function(index,item){
        var $item = $(item);
        var type = $item.attr('type');
        if(type == 'line'){
            drawLineFunc({},$item);
        }else{
            drawEllipseFunc({},$item);
        }
    });
}

//打开全屏模式
function openFull(ele){
    var src = $(ele).parent().prev().find('.view-img').attr('src');
    var width = 864;
    var height = 576;
    var body = document.body;

    var maxW = body.offsetWidth;
    var maxH = body.offsetHeight;
    var width,height;

    if(maxW/maxH > 4/3){
        height = maxH;
        width = height/3*4;
    }else{
        width = maxW;
        height = width/4*3;
    }
    $('#fullImg').attr('src',src).css({
        left:(maxW - width)/2 + 'px',
        top:(maxH - height)/2 + 'px',
        width:width + 'px',
        height:height + 'px'
    }).parent().show();
}

function hideFull(){
    $('#fullScreen').hide();
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
    var img = cacheImgList.shift();
    if(img){
        var $img = $(img);
        if($img.attr('src')){
            setTimeoutImg();
        }else{
            var errSrc = tempSrc;
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
    $(this).siblings('.loading-icon').hide();
    setTimeout(function() {
        setTimeoutImg();
    }, 30);
}

function imgErrorEvent() {
    this.src = tempSrc;
}

//获取url上数据
function getQueryString(name,win){
    var w = win || window;
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var search = w.location.search.substr(1);
    var href = w.location.href;
    if(href.indexOf("?")>=0){
        search = href.substr(href.indexOf("?")+1);
    }
    var r = search.match(reg);
    if (r){
        return decodeURIComponent(r[2]);
    }
    return null;
}
//提示弹窗方法
function promptWindow(info){
    var str ='<div class="prompt-mask fit"></div><div class="prompt-box"><div class="prompt-header"> <span>提示</span><div class="prompt-tool"><a class="prompt-tool-close"></a></div></div><div class="prompt-body fit"><div class="fit inline-box inline-box-m prompt-content"><div class="prompt-icon"></div><div class="prompt-text fit-width">'
        + info + '</div></div></div><div class="prompt-btnbox"><a class="w-btn icon-ok">确定</a></div></div>';
    var div = document.createElement('div');
    div.innerHTML = str;
    div.className = 'prompt-wrap';
    var closeFunc = function(){
        $(this).closest('.prompt-wrap').remove();
    };
    var toolCloseBtn = div.querySelector('.prompt-tool-close');
    var sureBtn = div.querySelector('.w-btn');
    $(toolCloseBtn).add(sureBtn).bind('click',closeFunc);
    document.body.appendChild(div);
}

/**
 * 收藏方法
 */
function collect(ele){
    var $item = $(ele).closest('.view-item').data('link');
    if(!$item){
        promptWindow('请选择一张图片！');
        return;
    }

    var row = getDataByItem($item).result.picture[$item.index()];
    var materialTypeCodes = [];
    var type = 5;
    var types = row.type || {};
    for(var typeString in types){
        materialTypeCodes.push(typeString);
    }
    $.ajax({
        type:'post',
        url:'json/saveCollectionMaterial.json',
        data:{
            infoId:row.MATERIALID,
            materialTypeCode:materialTypeCodes.join(','),
            infoType:type,
            remark:''
        },
        success:function(data){
            if(data && data.success){
                alert("收藏成功！");
            }else{
                alert("收藏失败！");
            }
        },error:function(){
            alert("操作失败！");
        }
    });
}

/**
 * 处理下载图片地址
 * @param url
 */
function getDownImgSrc(data) {
    var picSrc = "";
    var picSrc = '/'+getProName()+'/showfile?fileType=download&fileName='
        + data.FILENAME+ '&loadUrl='
        + escape(encodeURI(data.STOREKEY)) + '&contentType=image/jpeg&charset=GB2312';
    return picSrc;
}

function download(ele){

    var $item = $(ele).closest('.view-item').data('link');
    if(!$item){
        promptWindow('请选择一张图片！');
        return;
    }

    var row = getDataByItem($item).result.picture[$item.index()];
    webOcxUpload.uploadFile(row.STOREKEY+(row.FILENAME?"&filename="+row.FILENAME :''));
//	window.open(getDownImgSrc(rows[$act.index()]));
}
function downloadVideo(ele){
    var $item = $(ele).closest('.video-item');
    if($item.length){
        var row = $item.parent().data('data')[$item.index()];
        webOcxUpload.uploadFile(row.STOREKEY+(row.FILENAME?"&filename="+row.FILENAME :''));
    }
}

/**
 * 根据class获取输入框的值或赋值
 * @param className 指定的class名称
 * @param vname     指定的属性
 * @param data      赋值的数据，没有则是获取表单数据
 * @returns {{}}
 */
function formData(className,vname,data,doc){
    doc = doc || document;
    var list = doc.querySelectorAll('.' + className) || [];
    var result = {};
    for(var i = 0,len = list.length;i < len;i++){
        var $target = $(list[i]);
        var name = $target.attr(vname);
        if(name){
            name = name.toUpperCase();
            var name_ = name.split('_')[0].toUpperCase();

            var filter = $target.attr('filter') || 'filterNull';

            if(data){
                var filterFunc = filters[filter];
                var value = typeof filterFunc == 'function' ? filterFunc(data[name] || data[name_]) : (data[name] || data[name_]);
                if(name=='LONGITUDE'||name=='LATITUDE'){
                    value = (value||0)/ 1000000;
                }
                if(!value){
                    $target.closest('td').hide().prev().hide();
                }else{
                    $target.html(value).closest('td').show().prev().show();
                }
            }else{
                result[name] = target.innerHTML;
            }
        }
    }
    return result;
}

var filters = {
    filterNull:function(value){
        return value || '';
    }
}


/**
 * 图片绑定数据
 */
function bindLink($item,$box,caseRow){

    if(!$box){
        return;
    }

    if(!$item || !$item.length){
        clearLink($box);
        return;
    }
    if(!caseRow){
        caseRow = getDataByItem($item).result;
    }
    var row = $('#imgList').data('data')[$item.index()];
    var $re = $box.data('link');
    if(!$re || $re[0] != $item[0]){
        if($re){
            var bol = true;
            $box.siblings().each(function(index,item){
                var $a = $(item).data('link');
                if($a && $a[0] == $re[0]){
                    bol = false;
                }
            });
            bol && $re.removeClass('active');
        }
        var src = getImgSrc(row);
        var casename = caseRow.caseInfo.CASENAME;
        var $imgBox = $box.data('link',$item).find('.imgbox');
        $imgBox.children('img').attr('src',src).attr('title',casename);
//		bindDrawDiv($imgBox,row);//将框选的div绑定到$imgbox
        resizeImg();
    }
    var $vs = $item.parent().children(':visible');
    for(var i = 0,len = $vs.length;i < len;i++){
        if($vs[i] == $item[0]){
            $box.find('.img-count').html(i + 1 + '/' + len);
            break;
        }
    }

    $item.addClass('active');
    updateBZInfo(row,$box);
    updateViewScreen($box);
}

function getImgSrc(){
    return tempSrc;
}

/**
 * 根据展示框点击分屏数
 */
function updateViewScreen($box){
    var $imgSplit = $('#imgSplit');
    var sIndex = $imgSplit.children('.active').index();
    var index = $box.index();
    if(index > 1 && sIndex != 2 ){
        $imgSplit.children().eq(2).trigger('click');
    }else if(index == 1 && sIndex == 0){
        $imgSplit.children().eq(1).trigger('click');
    }
}



/**
 * 将框选的div绑定到$imgbox
 */
function bindDrawDiv($img,row){
    $img.find('.img-rect').remove();
    $img = $img.find('.imgbox');
    var data = {};
    if(row.vehicle && row.vehicle.length > 0){
        data.vehicle = getDrawDiv(row.vehicle,$img,'vehicle');
    }
    if(row.person  && row.person.length > 0){
        data.person = getDrawDiv(row.person,$img,'person');
    }
    return data;
}
/**
 * 获取画框div
 * @param data
 */
function getDrawDiv(data,$imgbox,type){
    if(!$imgbox[0].data)
        $imgbox[0].data = {};
    var $div;
    if(data.LEFTTOPX && data.LEFTTOPX!='0'){
        var LEFTTOPX = data.LEFTTOPX;
        var LEFTTOPY = data.LEFTTOPY;
        var RIGHTBTMX = data.RIGHTBTMX;
        var RIGHTBTMY = data.RIGHTBTMY;
        $div = drawRectLayer($imgbox,LEFTTOPX,LEFTTOPY,RIGHTBTMX,RIGHTBTMY);
//		$div.hide();
        $imgbox[0].data[type] = $div;
    }
    return $div;
}

var tempSrc = '../../../../img/1.jpg';

/**
 * 清除绑定
 * @param $box
 */
function clearLink($box){
    $box.removeData('link');
//	$box.find('.img-rect').remove();
    $box.find('.casename').html('').attr('title','');
    $box.find('.img-count').html('0/0');
    $box.find('.view-img').attr('src',tempSrc);
}

function getDataByItem($item){
//	var rowIndex = $item.closest('.case-item').index();
    return dataList[$item.attr('index')];
}

function play(ele){
    var $this = $(ele);
    var index = $this.index();
    var $item = $this.closest('.video-item');
    var rows = $('#videoList').data('data');
    var row = rows[$item.index()];

    var player = $('#player')[0];

//	$this.addClass('active');
    var $views = $('#viewType').children();

    $('#imgWrap').hide().siblings().show();
    $('#imgSplit').hide();
    $('#viewType').show();

    if(index == 1 && $views.first().hasClass('active')){
        $views.eq(1).trigger('click');
    }else if(index > 1){
        $views.last().trigger('click');
    }

    playingMid = row.MATERIALID;
    playingCid = row.CASEID;
    playVideo(true,index + 1,row.STOREKEY);
    $item.parent().find('.label-text:nth-child('+ ($this.index() + 1) +')').removeClass('active');
    $this.addClass('active');

}

//播放视频出错的时候
function OnOpenFile(handle,totalTime){
    if(handle==null||handle==0){
        var isCanPlay = '2';
        updateMaterialIsCanPlay(playingCid,playingMid,isCanPlay);
    }
}


/**
 * 显示所有画框
 */
function showRectAll(that){
    $('#container').removeClass('echart-hide');
    $(that).removeClass('active').siblings().addClass('active');
}

/**
 * 隐藏所有画框
 */
function hideRectAll(that){
    $('#container').addClass('echart-hide');
    $(that).removeClass('active').siblings().addClass('active');
}

/**
 * 填充多个标注标签（二轮车、三轮车...）
 * @param type  类型，人、车
 * @param $div  画框对象
 * @param row   对应的标注数据
 */
function fillMutilLabel(type,$d,row){
    var num = type == 'person' ? 1 : 2;
    var $div = num == 2 ? $('.veh-tab-box') : $('.per-tab-box');
    var info = row.INFOKIND;
    var char = getNextNumber(num);
    var text = row.PLATENO ||
        (info == '2'?("二轮车"+char) :
            info == '3'?("三轮车"+char) :
                info == '4'?("四轮车"+char) : (row.NAME || ("人"+ char) ) );
    var dom  = '<span class="type-item" index="'+char+'" value="'+info+'"><span>'+text+'</span></span>';
    $div.append(dom);
    //将画框数据绑定到生成的div中
    var current = $div.children(':last')[0];
    current.data = $d;
    current.row = row;
    if(!$div.children(':first').hasClass('active'))  $div.children(':first').trigger('click');
}
/**
 * 填充多个画线（过程图片）
 * @param data  数组 定位数据,json数组
 * @param index 选中图片索引
 * @param $div  画框对象
 */
function fillMutilLine(data,index,$d){
    if($('#main').hasClass('hideBZ')){
        $('#main').removeClass('hideBZ');
    }
    var $div = $('.line-tab-box');
    for(var d = 0 ; d < data.length ; d++){
        var char = getNextNumber('0');
        var text = "线"+char;
        var dom  = '<span class="type-item" index="'+char+'"><span>'+text+'</span><i class="type-item-remove" onclick="removeTypeFunc(this)"></i></span>';
        $div.append(dom);
        //将画框数据绑定到生成的div中
        var xy = {"LEFTTOPX":data[d].LEFTTOPX,"LEFTTOPY":data[d].LEFTTOPY,"RIGHTBTMX":data[d].RIGHTBTMX,"RIGHTBTMY":data[d].RIGHTBTMY};
        var current = $div.children(':last')[0];
        current.data = $d;
        current.xy = xy;
    }
    $div.children(':last').trigger('click');
}
function getNextNumber(type){
    try{
        if(type == '0'){
            var objs = $('.line-tab-box').children(':last');
            if(objs.length == 0){
                return 1;
            }else{
                return  Number($(objs[0]).attr('index'))+1;
            }
        }else if(type == '1'){
            var objs = $('.per-tab-box').children(':last');
            if(objs.length == 0){
                return 1;
            }else{
                return  Number($(objs[0]).attr('index'))+1;
            }
        }else{
            var objs = $('.veh-tab-box').children(':last');
            if(objs.length == 0){
                return 1;
            }else{
                return  Number($(objs[0]).attr('index'))+1;
            }
        }
    }catch(e){
        return "";
    }
}