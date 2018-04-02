




require.config({
    baseUrl:'../',
    paths:{
    }
});


/**
 * 根据数据画图
 * @param row
 * @param $box
 * @param config 类型配置，默认画所有
 */
function dealEcharts(row,$box,color,config){
    var obj = {
        drawEllipseFunc:[],
        drawRectFunc:[],
        drawLineFunc:[]
    };
    if((!config || config.person) && row.person && row.person.length){
        filterDrawData(row.person,obj,1);
    }
    if((!config || config.vehicle) && row.vehicle && row.vehicle.length){
        filterDrawData(row.vehicle,obj,2);
    }
    var LINELOCATION = row.LINELOCATION;
    if((!config || config.gc) && LINELOCATION){
        if(LINELOCATION.indexOf('[') == 0){
            filterDrawData([{LINELOCATION:LINELOCATION}],obj);
        }else{
            LINELOCATION.split('$').forEach(function(str,index){
                var p = str.split(',');
                obj.drawLineFunc.push({
                    x1:p[0],
                    y1:p[1],
                    x2:p[2],
                    y2:p[3],
                    mtype:'gj_' + index
                });
            })
        }
    }
    var ary = drawAll(obj,$box,null,color);

    return
}

function filterDrawData(ary,obj,typeCode){
    var translate = ['','drawEllipseFunc','drawRectFunc','drawLineFunc'];
    var typeCode = typeCode || 3;
    var mtype = typeCode == 1 ? 'person' : typeCode == 2 ? 'vehicle' : 'gj';
    ary.forEach(function(rect,index){
        var linelocation = rect.LINELOCATION;
        if(linelocation){
            linelocation = typeof linelocation == 'string' ? JSON.parse(linelocation) : linelocation;
            linelocation.forEach(function(item){
                obj[translate[item.TYPE]].push({
                    x1:item.LEFTTOPX,
                    y1:item.LEFTTOPY,
                    x2:item.RIGHTBTMX,
                    y2:item.RIGHTBTMY,
                    mtype:mtype + '_' + index
                });
            });
        }else if(rect.LEFTTOPX != undefined){
            obj[translate[typeCode || 3]].push({
                x1:rect.LEFTTOPX,
                y1:rect.LEFTTOPY,
                x2:rect.RIGHTBTMX,
                y2:rect.RIGHTBTMY,
                mtype:mtype + '_' + index
            });
        }
    });
    return obj;
}



/**
 * 画图方法
 * @param data
 * @param $box
 * @param win
 */
function drawAll(data,$box,win,color){
    var width = $box.width();
    var height = $box.height();
    win = win || window;
    var result = [];
    for(var type in data){
        var func = win[type];
        if(typeof func == 'function'){
            var ary = data[type] || [];
            ary.forEach(function(point,index){
                if(type == 'drawRectFunc'){
                    result.push(func({
                        x1:+point.x1,
                        y1:+point.y1,
                        x2:+point.x2,
                        y2:+point.y2,
                        color:color,
                        mtype:point.mtype
                    },$box));
                }else{
                    result.push(func({
                        x1:+point.x1 * width,
                        y1:+point.y1 * height,
                        x2:+point.x2 * width,
                        y2:+point.y2 * height,
                        color:color,
                        mtype:point.mtype
                    },null,$box));
                }
            });
        }
    }
    return result;
}



/**
 * 画矩形
 * @param opt
 * @param $box
 */
function drawRectFunc(opt,$box){
    var l = opt.x1 * 100 + '%';
    var t = opt.y1 * 100 + '%';
    var w = Math.abs(opt.x1 - opt.x2) * 100 + '%';
    var h = Math.abs(opt.y1 - opt.y2) * 100 + '%';
    var $div = $('<div mtype="'+ opt.mtype +'" class="img-rect '+ (opt.color ? '' : 'active') +'" style="left:' + l + ';top:'+ t +';width:'+ w +';height:'+ h +';"></div>');
    $box.append($div);
}

/**
 /* 画圈方法
 */
function drawEllipseFunc(opt,$div,$box){
    var px1,py1,px2,py2,str,width,height;
    if(!$div){
        $box = $box || $('#viewImg');
        $div = $('<div mtype="'+ opt.mtype +'" class="img-line" type="ellipse"></div>');
        $box.append($div);
    }
    $box = $box || $div.parent();
    width =  $box.width();
    height =  $box.height();

    if(opt.x1 == undefined){
        var pointAry = $div.attr('size').split(',');
        opt.x1 = +pointAry[0] * width;
        opt.y1 = +pointAry[1] * height;
        opt.x2 = +pointAry[2] * width;
        opt.y2 = +pointAry[3] * height;
    }else{
        px1 = opt.x1 / width;
        py1 = opt.y1 / height;
        px2 = opt.x2 / width;
        py2 = opt.y2 / height;
        str = px1 + ',' + py1 + ',' + px2 + ',' + py2;
        $div.attr('size',str);
    }
    var shape = {
        cx:(opt.x1 + opt.x2) / 2,
        cy:(opt.y1 + opt.y2) / 2,
        rx:Math.abs(opt.x1 - opt.x2) / 2,
        ry:Math.abs(opt.y1 - opt.y2) / 2,
    };

    var startDraw = $div.data('startDraw');
    if(startDraw){
        var zr = $div.data('zr');
        if(zr){
            var mk = zr.storage.getDisplayList(true)[0];
            if(mk){
                mk.setShape(shape);
                opt.color && mk.setStyle({stroke:opt.color});
                zr.resize();
                zr.refreshImmediately();
            }
        }else{
            $div.data('waitingOp',opt);
        }
    }else{
        $div.data('startDraw',1);
        require(["zrender/zrender", 'zrender/graphic/shape/Ellipse','zrender/vml/vml'], function(zrender, Ellipse){
            // 初始化zrender
            var zr = zrender.init($div[0]);
            var id = 'zr' + +new Date();

            var op = $div.data('waitingOp');
            if(op){
                opt = op;
                shape = {
                    cx:(opt.x1 + opt.x2) / 2,
                    cy:(opt.y1 + opt.y2) / 2,
                    rx:Math.abs(opt.x1 - opt.x2) / 2,
                    ry:Math.abs(opt.y1 - opt.y2) / 2,
                };
            }

            var options = {
                id:id,
                shape:shape,
                cursor:"default",
                silent:true,
                style:{
                    fill:null,
                    lineWidth:2,
                    stroke:opt.color || 'red'
                }
            };
            var ellipse = new Ellipse(options);
            zr.add(ellipse);
            $div.data('zr',zr);

        });
    }
    return $div;
}


/**
 /* 画线方法
 */
function drawLineFunc(opt,$div,$box){
    var px1,py1,px2,py2,str,width,height;
    if(!$div){
        $box = $box || $('#viewImg');
        $div = $('<div mtype="'+ opt.mtype +'" class="img-line" type="line"></div>');
        $box.append($div);
    }
    $box = $box || $div.parent();
    width =  $box.width();
    height =  $box.height();

    if(opt.x1 == undefined){
        var pointAry = $div.attr('size').split(',');
        opt.x1 = +pointAry[0] * width;
        opt.y1 = +pointAry[1] * height;
        opt.x2 = +pointAry[2] * width;
        opt.y2 = +pointAry[3] * height;
    }else{
        px1 = opt.x1 / width;
        py1 = opt.y1 / height;
        px2 = opt.x2 / width;
        py2 = opt.y2 / height;
        str = px1 + ',' + py1 + ',' + px2 + ',' + py2;
        $div.attr('size',str);
    }
    var startDraw = $div.data('startDraw');
    if(startDraw){
        var zr = $div.data('zr');
        if(zr){
            var mk = zr.storage.getDisplayList(true)[0];
            if(mk){
                mk.setShape(opt);
                opt.color && mk.setStyle({stroke:opt.color});
                zr.resize();
                zr.refreshImmediately();
            }
        }
    }else{
        $div.data('startDraw',1);
        require(["zrender/zrender", 'zrender/graphic/shape/MarkLine','zrender/vml/vml'], function(zrender, MarkLine){
            // 初始化zrender
            var zr = zrender.init($div[0]);
            var id = 'zr' + +new Date();
            var options = {
                id:id,
                shape:opt,
                cursor:"default",
                silent:true,
                style : {
                    symbol:['none','arrow'],
                    symbolRotate:[0,-90],//第一个值不确定。第二个值的范围[-180,180],按上北下南来看，北方表示1和-1。南方表示180和-180，西方表示90，东方表示-90。0表示水平，并且顶点为线段终点。
                    symbolSize:[0,4],
                    lineWidth : 2,
                    stroke:opt.color || 'red'
                }
            };
            var line = new MarkLine(options);
            zr.add(line);
            $div.data('zr',zr);
        });
    }
    return $div;
}


function redraw($div){
    $div.find('.img-line').each(function(index,item){
        var $item = $(item);
        var type = $item.attr('type');
        if(type == 'ellipse'){
            drawEllipseFunc({},$item);
        }else{
            drawLineFunc({},$item);
        }
    });
}


function updateLineByOpt($div,option){
    drawLineFunc(option,$div);
}
