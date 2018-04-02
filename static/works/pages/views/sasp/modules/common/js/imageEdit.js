$(function(){
    $('body').bind('dragstart',function(){
        return false;
    }).bind('selectstart',function(){
        return false;
    });
    if(document.documentMode == 8){
        window.innerHeight = document.body.offsetHeight;
        window.innerWidth = document.body.offsetWidth;
    }
});

var _basePath = '/'+window.location.pathname.split('/')[0];
var topPage = window.opener ? window.opener.topPage || {} : {};


/**
 * 截图
 */
function cutDown(param){
    var x1 = param.x1 * 10000,
        y1 = param.y1 * 10000,
        x2 = param.x2 * 10000,
        y2 = param.y2 * 10000;
    var info = WebOcx.FileToOCR($('#viewImg').children('img').attr('src'), x1, y1, x2, y2);

//	var re = /time=[^;]*(;text=([^\s]*\s[^\s]*)\s([\w\W]*$))?/;

    if(info == ''){
        $.dlg.alertInfo('文字识别失败！');
        return;
    }


    var timeRe = /time=([^;]+)/;
    var timeMatch = info.match(timeRe);

    var textRe = /text=([\w\W]*$)/;
    var textMatch = info.match(textRe);

    var time;
    var ary = [];

    if(textMatch){
        ary = textMatch[1].split(' ');
    }

    if(timeMatch){
        time = timeMatch[1];
        $('#materialDate').datetimebox('setValue',time);
        ary.unshift(time);
    }

    createKey(ary);
}



function cutEcarsDown(param){
    var picUrl = $('#viewImg').attr('src');
    var data = {picUrl:picUrl};
    $.extend(data,param);
    if(picUrl.indexOf('http://') == 0 || picUrl.indexOf('ftp://') == 0){
        $.ajax({
            type:'post',
            url:'caseInfoVideoAction!getEcarsData.do',
            data:data,
            success:function(ret){
                if(ret.success){
                    fillVehicleData(ret.data);
                }else{
                    $.dlg.alertInfo("识别错误，可能是服务未连通！");
                }
            }
        });
    }else{
        $.dlg.alertInfo("该图片无法进行车型识别，请检查图片地址是否正确！");
    }
}


/**
 * 截图方法
 * @param fn 截图成功后调用
 */
function cut(ele){
    $(ele).addClass('active');
    var $body = $('body');
    var $box = $('<div class="cut-cover"></div>');
    $body.append($box);
    $box.mousedown(function(ev){
        var $this = $(this);
        var $doc = $(document);
        var e = ev || event;
        var ox = e.clientX;
        var oy = e.clientY;

        var btnRect = ele.getBoundingClientRect();

        if(ox > btnRect.left && ox < btnRect.right && oy < btnRect.bottom && oy > btnRect.top){
            $this.remove();
            $(ele).removeClass('active');
            return;
        }

        var $div = $('<div class="cut-box"><div class="cut-div pos-lt"></div><div class="cut-div pos-lb"></div><div class="cut-div pos-rt"></div><div class="cut-div pos-rb"></div><div class="cut-div pos-ct"></div> <div class="cut-div pos-cb"></div> <div class="cut-div pos-cl"></div><div class="cut-div pos-cr"></div><div class="cut-btnbox"> <a class="w-btn icon-ok">确定</a> <a class="w-btn icon-cancle">取消</a> </div></div>');
        var $body = $('body');
        $('.cut-box').remove();

        $div.css({
            left:ox + 'px',
            top:oy + 'px',
            width:0,
            height:0,
            right:innerWidth - ox - 1 + 'px',
            bottom:innerHeight - oy - 1 + 'px'
        });
        var isDragstart = false;
//	    $body.append($div);
        $div.mousedown(function(ev){
            var $box = $(this);
            var $doc = $(document);
            var rect = this.getBoundingClientRect();
            var e = ev || event;
            var target = e.target || e.srcElement;
            var $target = $(target);
            if($target.hasClass('icon-ok')){


                var imgRect = document.getElementById('viewImg').getBoundingClientRect();
                var imgWidth = imgRect.width || imgRect.right - imgRect.left;
                var imgHeight = imgRect.height || imgRect.bottom - imgRect.top;

                var cLeft =  rect.left < imgRect.left ? imgRect.left : rect.left;
                var cTop = rect.top < imgRect.top ? imgRect.top : rect.top;
                var cRight = rect.right > imgRect.right ? imgRect.right : rect.right;
                var cBottom = rect.bottom > imgRect.bottom ? imgRect.bottom : rect.bottom;

                $(this).remove();
                $this.remove();
                $(ele).removeClass('active');
                if(typeof cutDown == 'function'){
                    setTimeout(function(){
                        var param = {
                            x1:(cLeft - imgRect.left + 1) / imgWidth,
                            y1:(cTop - imgRect.top + 1) / imgHeight,
                            x2:(cRight - imgRect.left) / imgWidth,
                            y2:(cBottom - imgRect.top) / imgHeight
                        };
                        if($(ele).hasClass('icon-cut')){
                            cutDown(param);
                        }else if($(ele).hasClass('icon-autoEcars')){
                            var img = document.getElementById('viewImg');
                            var src = img.src;
                            var vImg = new Image();
                            vImg.onload = function(){
                                var ow = vImg.width;
                                var oh = vImg.height;
                                var param2 = {
                                    x1:param.x1 * ow,
                                    y1:param.y1 * oh,
                                    width:(param.x2 - param.x1) * ow,
                                    height:(param.y2 - param.y1) * oh
                                };
                                cutEcarsDown(param2);
                            };
                            vImg.src = src;
                        }
                    },30);
                }
//	            console.log('x1:' + (cLeft - imgRect.left + 1));
//	            console.log('y1:' + (cTop - imgRect.top + 1));
//	            console.log('x2:' + (cRight - imgRect.left));
//	            console.log('y2:' + (cBottom - imgRect.top));
            }else if($target.hasClass('icon-cancle')){
                $(this).remove();
                $this.remove();
                $(ele).removeClass('active');
            }else if($target.hasClass('cut-div')){
                var className = $target.attr('class');
                var re = /pos-(\w+)/;
                var type = className.match(re)[1];

                var cssOpt = {
                    left:'auto',
                    top:'auto'
                };

                var posOpt = {
                    left:rect.left + 'px',
                    top:rect.top + 'px',
                    right:innerWidth - rect.right + 'px',
                    bottom:innerHeight - rect.bottom + 'px'
                };
                var posAry,w,h;
                switch(type){
                    case 'lt':
                        posAry = ['right','bottom'];
                        w = -1;
                        h = -1;
                        break;
                    case 'ct':
                        posAry = ['left','bottom'];
                        h = -1;
                        break;
                    case 'rt':
                        posAry = ['left','bottom'];
                        w = 1;
                        h = -1;
                        break;
                    case 'cr':
                        posAry = ['left','top'];
                        w = 1;
                        break;
                    case 'rb':
                        posAry = ['left','top'];
                        w = 1;
                        h = 1;
                        break;
                    case 'cb':
                        posAry = ['left','top'];
                        h = 1;
                        break;
                    case 'lb':
                        posAry = ['right','top'];
                        w = -1;
                        h = 1;
                        break;
                    case 'cl':
                        posAry = ['right','top'];
                        w = -1;
                        break;
                }
                var getMoveCssFunc = function(e){
                    var obj = {};
                    if(w){
                        obj.width = w > 0 ? e.clientX - rect.left + 'px' : rect.right - e.clientX + 'px';
                    }
                    if(h){
                        obj.height = h > 0 ? e.clientY - rect.top + 'px' : rect.bottom - e.clientY + 'px';
                    }
                    return obj;
                };
                for(var i = 0;i < posAry.length;i++){
                    var direct = posAry[i];
                    cssOpt[direct] = posOpt[direct];
                }
                $box.css(cssOpt);
                $doc.mousemove(function(ev){
                    var e = ev || event;
                    $box.css(getMoveCssFunc(e));
                });
                $doc.mouseup(function(){
                    $doc.unbind('mousemove');
                    $doc.unbind('mouseup');
                });
            }else{
                $box.css({
                    left:rect.left + 'px',
                    top:rect.top + 'px'
                });
                var dx = e.clientX - rect.left;
                var dy = e.clientY - rect.top;
                var maxX = innerWidth - rect.right + rect.left;
                var maxY = innerHeight - rect.bottom + rect.top;
                var $btnBox = $box.children('.cut-btnbox');
                $doc.mousemove(function(ev){
                    var e = ev || event;
                    var x = e.clientX - dx;
                    var y = e.clientY - dy;
                    if(x < 0){
                        x = 0;
                    }
                    if(x > maxX){
                        x = maxX;
                    }
                    if(y < 0){
                        y = 0;
                    }
                    if(y > maxY){
                        y = maxY;
                    }
                    var btnPos = {
                        top:'-36px',
                        bottom:'-36px'
                    };
                    if(maxY - y > 36){
                        btnPos.top = 'auto';
                    }
                    $btnBox.css(btnPos);

                    $box.css({
                        left: x + 'px',
                        top: y + 'px'
                    });
                });
                $doc.mouseup(function(){
                    $doc.unbind('mousemove');
                    $doc.unbind('mouseup');
                });
            }
            if(e.stopPropagation){
                e.stopPropagation();
            }else{
                e.cancelBubble = true;
            }
        });
        $doc.mousemove(function(ev){
            var e = ev || event;
            var cx = e.clientX;
            var cy = e.clientY;
            var dx = cx - ox;
            var dy = cy - oy;

            if(isDragstart){
                var posLeft = 'auto';
                var posTop = 'auto';
                if(dx > 0){
                    posLeft = ox + 'px';
                }
                if(dy > 0){
                    posTop = oy + 'px';
                }
                $div.css({
                    left:posLeft,
                    top:posTop,
                    width:Math.abs(dx) + 'px',
                    height:Math.abs(dy) + 'px'
                });
            }else if(Math.abs(cx - ox) > 10
                || Math.abs(cy - oy) > 10){
                isDragstart = true;
                $('body').append($div);
            }
        });
        $doc.mouseup(function(){
            $doc.unbind('mousemove');
            $doc.unbind('mouseup');
            $div.find('.cut-btnbox').show();
        });
    });
}
/**
 * 开始框选
 * @param ele
 */
function drawRect(ele){
    if(!checkBeforeDraw()){
        return;
    }
    var $ele = $(ele);
//	if($ele.hasClass('active')){
//		$ele.removeClass('active');
//		$('#viewImg').data('btn',ele).unbind('mousedown').bind('mousedown',mousedown);
//	}else{
    $ele.addClass('active').siblings().removeClass('active');
    $('#viewImg').data('btn',ele).unbind('mousedown').bind('mousedown',mousedownDraw);
    $('#viewImg').addClass('tenCls');
//	var value = $ele.attr('value');
//	showVehicleDiv(value);
//	}
}

//画图前校验
function checkBeforeDraw(){
    var $img = getCurrent$img();
    if(!$img || !$img.length){
        return;
    }
    if($(".type-item.active","#typesBox").attr("value") == 'vehicle' && $(".keyword-left-item.opthistory").hasClass("active")){
        $.dlg.alertInfo("请切换到四轮车、三轮车或二轮车之后，再画图");
        return false;
    }
    return true;
}

/**
 * 展示不同车div
 */
function showVehicleDiv(value){
    if(value != "1"){
        if(value == "4"){
            $('#veh_2').hide();
            $('#veh_3').hide();
            $('#veh').show();
        }else if(value == '3'){
            $('#veh').hide();
            $('#veh_2').hide();
            $('#veh_3').show();
        }else if(value == '2'){
            $('#veh_3').hide();
            $('#veh').hide();
            $('#veh_2').show();
        }
    }
}

//框选
function mousedownDraw(ev){
    var $this = $(this);
    var ele = $this.data('btn');
    var $doc = $(document);
    var e = ev || event;
    var ex = e.clientX;
    var ey = e.clientY;
    var imgRect = this.getBoundingClientRect();
    var innerWidth = this.offsetWidth;
    var innerHeight = this.offsetHeight;
    var ox = ex - imgRect.left;
    var oy = ey - imgRect.top;

    var $div = $('<div class="img-rect"></div>');
    $div.css({
        left:ox/innerWidth * 100 + '%',
        top:oy/innerHeight * 100 + '%',
        width:0,
        height:0,
        right:(innerWidth - ox - 1)/innerWidth * 100 + '%',
        bottom:(innerHeight - oy - 1)/innerHeight * 100 + '%'
    });
    var isDragstart = false;
    $doc.mousemove(function(ev){
        var e = ev || event;
        var cx = e.clientX;
        var cy = e.clientY;
        var dx = cx - ex;
        var dy = cy - ey;

        if(isDragstart){
            var posLeft = 'auto';
            var posTop = 'auto';
            if(dx > 0){
                posLeft = ox / innerWidth * 100 + '%';
                dx = dx > innerWidth - ox ? innerWidth - ox : dx;
            }else{
                dx = -dx > ox ? ox + 1: dx;
            }
            if(dy > 0){
                posTop = oy/innerHeight * 100 + '%';
                dy = dy > innerHeight - oy ? innerHeight - oy : dy;
            }else{
                dy = -dy > oy ? oy + 1: dy;
            }
            $div.css({
                left:posLeft,
                top:posTop,
                width:Math.abs(dx)/innerWidth * 100 + '%',
                height:Math.abs(dy)/innerHeight * 100 + '%'
            });
        }else if(Math.abs(cx - ox) > 10
            || Math.abs(cy - oy) > 10){
            isDragstart = true;
            $this.append($div);
        }
    });
    $doc.mouseup(function(){
        $doc.unbind('mousemove');
        $doc.unbind('mouseup');
        $this.unbind('mousedown',mousedownDraw).bind('mousedown',mousedown);
        $('#viewImg').removeClass('tenCls');
        var $ele = $(ele);
        $ele.removeClass('active');
        var type = $ele.attr('data-type');//画图类型
        var rect = $div[0].getBoundingClientRect();
        var imgWidth = imgRect.width || imgRect.right - imgRect.left;
        var imgHeight = imgRect.height || imgRect.bottom - imgRect.top;

        var x1 = rect.left - imgRect.left +1;
        var y1 = rect.top - imgRect.top + 1;
        var x2 = rect.right - imgRect.left;
        var y2 = rect.bottom - imgRect.top;
        newLabel(type,x1/imgWidth,y1/imgHeight,x2/imgWidth,y2/imgHeight,$div);
    });
}


/**
 * 点画线
 * @param ele
 */
function drawLine(ele){
    if(!checkBeforeDraw()){
        return;
    }
    var $ele = $(ele);
    $ele.addClass('active').siblings().removeClass('active');
    $('#viewImg').data('btn',ele).unbind('mousedown').bind('mousedown',mousedownLine);
    $('#viewImg').addClass('tenCls');
}

function mousedownLine(ev){
    var $this = $(this);
    var $btn = $(".img-tbtn.draw-tool.active"); //图形类型
    var $doc = $(document);
    var e = ev || event;
    var ex = e.clientX;
    var ey = e.clientY;
    var imgRect = this.getBoundingClientRect();
    var innerWidth = this.offsetWidth;
    var innerHeight = this.offsetHeight;
    var ox = ex - imgRect.left;
    var oy = ey - imgRect.top;

    var $div;
    var isDragstart = false;
    $doc.mousemove(function(ev){
        var e = ev || event;
        var cx = e.clientX;
        var cy = e.clientY;
        var dx = cx - ex;
        var dy = cy - ey;

        if(isDragstart){
            drawLineFunc({
                x1:ex - imgRect.left,
                y1:ey - imgRect.top,
                x2:cx - imgRect.left,
                y2:cy - imgRect.top
            },$div);
        }else if(Math.abs(cx - ox) > 10
            || Math.abs(cy - oy) > 10){
            isDragstart = true;
            $div = drawLineStart(ex - imgRect.left,ey - imgRect.top);
        }
    });
    $doc.mouseup(function(ev){
        var e = ev || event;
        var cx = e.clientX;
        var cy = e.clientY;
        $doc.unbind('mousemove');
        $doc.unbind('mouseup');
        $this.unbind('mousedown').bind('mousedown',mousedown);
        $('#viewImg').removeClass('tenCls');
        var type = $btn.attr('data-type');
        $btn.removeClass('active');
        var sx = ex - imgRect.left;
        var sy = ey - imgRect.top;
        var vx = cx - imgRect.left;
        var vy = cy - imgRect.top;
        newLabel(type,sx/innerWidth,sy/innerHeight,vx/innerWidth,vy/innerHeight,$div);
    });
}

function drawLineByPoint(){
    if(arguments.length < 2){
        $.dlg.alertInfo('至少需要两个点才能画线！');
        return;
    }
    for(var i = 1,len = arguments.length;i < len;i++){
        drawLineFunc(arguments[i - 1],arguments[i]);
    }
}



function drawLineStart(x,y,x2,y2,$box){
    x2 = x2 || x;
    y2 = y2 || y;
    $box = $box || $('#viewImg');
    var $div = $('<div class="img-line"></div>');
    $box.append($div);
    drawLineFunc({
        x1:x,
        y1:y,
        x2:x2,
        y2:y2
    },$div);
    return $div;
}

//function updateLine($div,x,y){
//	var zr = $div.data('zr');
//	if(zr){
//		var mk = zr.storage.getDisplayList()[0];
//		if(mk){
//			var pointList = mk.style.pointList;
//			var startPoint = pointList[0];
//			drawLineFunc({
//				x1:startPoint[0],
//				y1:startPoint[1],
//				x2:x,
//				y2:y
//			},$div);
//		}
//	}
//}



function drawEllipse(ele){
    if(!checkBeforeDraw()){
        return;
    }
    var $ele = $(ele);
    $ele.addClass('active').siblings().removeClass('active');
    $('#viewImg').data('btn',ele).unbind('mousedown').bind('mousedown',mousedownEllipse);
    $('#viewImg').addClass('tenCls');
//	var value = $ele.attr('value');
//	showVehicleDiv(value);
}



function mousedownEllipse(ev){
    var $this = $(this);
    var $btn = $(".img-tbtn.draw-tool.active"); //图形类型
    var $doc = $(document);
    var e = ev || event;
    var ex = e.clientX;
    var ey = e.clientY;
    var imgRect = this.getBoundingClientRect();
    var innerWidth = this.offsetWidth;
    var innerHeight = this.offsetHeight;
    var ox = ex - imgRect.left;
    var oy = ey - imgRect.top;

    var $div;
    var isDragstart = false;
    var x1 = ex - imgRect.left;
    var y1 = ey - imgRect.top;
    $doc.mousemove(function(ev){
        var e = ev || event;
        var cx = e.clientX;
        var cy = e.clientY;
        var dx = cx - ex;
        var dy = cy - ey;
        if(isDragstart){
            var x2 = cx - imgRect.left;
            var y2 = cy - imgRect.top;
            aa = +new Date();
            drawEllipseFunc({
                x1:x1,
                y1:y1,
                x2:x2,
                y2:y2
            },$div);
        }else if(Math.abs(cx - ox) > 10
            || Math.abs(cy - oy) > 10){
            isDragstart = true;
            $div = drawEllipseFunc({x1:x1,y1:y1,x2:x1 + 2,y2:y1 + 2});
        }
    });
    $doc.mouseup(function(ev){
        var e = ev || event;
        var cx = e.clientX;
        var cy = e.clientY;
        $doc.unbind('mousemove');
        $doc.unbind('mouseup');
        $this.unbind('mousedown').bind('mousedown',mousedown);
        $('#viewImg').removeClass('tenCls');
        var type = $btn.attr('data-type');
        $btn.removeClass('active');
        var sx = ex - imgRect.left;
        var sy = ey - imgRect.top;
        var vx = cx - imgRect.left;
        var vy = cy - imgRect.top;
        newLabel(type,sx/innerWidth,sy/innerHeight,vx/innerWidth,vy/innerHeight,$div);
    });
}


function clearDrawStatus(){
    var $doc = $(document);
    $doc.unbind('mousemove');
    $doc.unbind('mouseup');
    $('#viewImg').unbind('mousedown').bind('mousedown',mousedown).removeClass('tenCls');
    $(".img-tbtn.draw-tool.active").removeClass('active');
}