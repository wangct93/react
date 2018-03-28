/**
 * Created by Administrator on 2017/12/6.
 */
var util = require('../util/util');
window.wt = util;
var $ = require('../$/$');
window.$ = window.$ || $;

/*初始化窗口宽高*/
window.innerHeight = window.innerHeight || document.documentElement.offsetHeight;
window.innerWidth = window.innerWidth || document.documentElement.offsetWidth;

/**
 * ie判断DOM元素加载完成事件
 * @param fn
 */
function ieDOMReady(fn){
    try{
        document.documentElement.doScroll('left');
        fn();
    }catch(e){
        setTimeout(function(){
            ieDOMReady(fn);
        },10);
    }
}
/**
 * 判断是否为ie浏览器
 * @returns {boolean}
 */
function isIE() {
    return 'ActiveXObject' in window;
}
/**
 * 判断是否为火狐浏览器
 * @returns {boolean}
 */
function isFirefox(){
    return navigator.userAgent.indexOf('Firefox') != -1;
}
/**
 * 判断是否为火狐浏览器
 * @returns {boolean}
 */
function isChrome(){
    return navigator.userAgent.indexOf('Chrome') != -1;
}
/**
 * 判断是否为Opera浏览器
 * @returns {boolean}
 */
function isOpera(){
    return navigator.userAgent.indexOf('Opera') != -1;
}
/**
 * 判断是否为Safari浏览器
 * @returns {boolean}
 */
function isSafari(){
    return navigator.userAgent.indexOf('Safari') != -1;
}



/**
 * 封装找元素方法
 * @param selector
 * @param context
 * @returns {Element}
 */

window.qs = function(selector,context){
    context = context || document;
    return context.querySelector(selector);
};
window.qsAll = function(selector,context){
    context = context || document;
    return context.querySelectorAll(selector);
};


/**
 * 画框方法mousedown
 * @param e
 */
function drawRectMousedown(e){
    var $div = $('<div class="rect-box"></div>');
    var $this = $(this);
    var rect = $this.getRect();
    var ox = e.clientX - rect.left;
    var oy = e.clientY - rect.top;
    var width = rect.width || rect.right - rect.left;
    var height = rect.height || rect.bottom - rect.top;
    $this.append($div);
    var posRight = width - ox;
    var posBottom = height - oy;
    $div.css({
        right:posRight / width * 100 + '%',
        bottom:posBottom / height * 100 + '%',
        width:0,
        height:0
    });

    var mousemove = function(e){
        var posLeft = 'auto';
        var posTop = 'auto';
        var cx = e.clientX - rect.left;
        var cy = e.clientY - rect.top;
        var dx = cx - ox;
        var dy = cy - oy;
        if(dx > 0){
            posLeft = ox / width * 100 + '%';
            dx = Math.min(dx,width - ox);
        }else{
            dx = Math.min(-dx,ox);
        }
        if(dy > 0){
            posTop = oy / height * 100 + '%';
            dy = Math.min(dy,height - oy);
        }else{
            dy = Math.min(-dy,oy);
        }
        $div.css({
            left:posLeft,
            top:posTop,
            width:dx / width * 100 + '%',
            height:dy / height * 100 + '%'
        });
    };

    var opt = this.drawRectOpt;
    var mouseup = function(e){
        var cx = Math.max(Math.min(e.clientX - rect.left,width),0);
        var cy = Math.max(Math.min(e.clientY - rect.top,height),0);
        var pleft = Math.min(ox,cx) / width;
        var ptop = Math.min(oy,cy) / height;
        var pwidth = Math.abs(ox - cx) / width;
        var pheight = Math.abs(oy - cy) / height;
        $div.css({
            left:pleft * 100 + '%',
            top:ptop * 100 + '%',
            width: pwidth * 100 + '%',
            height: pheight * 100 + '%'
        });
        $div.attr('coord',pleft + ',' + ptop + ',' + (pleft + pwidth) + ',' + (ptop + pheight));
        $('body').off('mousemove',mousemove).off('mouseup',mouseup);
        util.execFunc(opt.mouseup,$div);
    };
    $('body').mousemove(mousemove).mouseup(mouseup);
}



/**
 * 表单ajax提交
 * @param option
 */
function ajaxSubmit(option){
    var default_options = {
        url:'/',
        method:'post',
        enctype:'multipart/form-data'
    };
    var opt = util.extend({},default_options,option);
    if(window.FormData){
        ajaxSubmitForFormData(opt);
    }else{
        ajaxSubmitForIE8(opt);
    }
}

/**
 * 谷歌表单提交
 * @param opt
 */
function ajaxSubmitForFormData(opt){
    var data = new FormData();
    var form = opt.form;
    $(form).find('input').forEach(function(input){
        var $input = $(input);
        var name = $input.attr('name');
        if(name){
            if($input.attr('type') == 'file'){
                util.forEach(input.files,function(file,i){
                    data.append(name + '_' + i,file);
                });
            }else{
                data.append(name,input.value);
            }
        }
    });
    util.ajax({
        url:opt.url,
        type:opt.method,
        data:data,
        processData:false,
        contentType:false,
        success:opt.success,
        error:opt.error
    });
}

/**
 * IE8表单提交，只适合本地后台
 * @param opt
 */
function ajaxSubmitForIE8(opt){
    var form = opt.form;
    var $form = $(form);
    if(opt.enctype){
        $form.attr('enctype',opt.enctype);
    }
    if(opt.method){
        $form.attr('method',opt.method);
    }
    if(opt.url){
        $form.attr('action',opt.url);
    }
    var $cloneForm = $form.clone(true);
    var $iframe = $('<iframe style="display: none"></iframe>');

    var load = function(){
        $iframe.off('load',load);
        var doc = getDoc(this);
        $iframe.after($form);
        doc.body.appendChild(form);
        try {
            form.submit();
        } catch(err) {
            // just in case form has element with name/id of 'submit'
            var submitFn = document.createElement('form').submit;
            submitFn.apply(form);
        }
        var _this = this;
        var startTime = +new Date();
        var timeout = opt.timeout || 6000;
        var timer = setInterval(function () {
            if(+new Date() - startTime > timeout){
                clearInterval(timer);
                console.log('the ajaxSubmit is timeout!');
                util.execFunc(opt.error);
                $iframe.remove();
            }else{
                var doc = getDoc(_this);
                if(doc && doc.body.innerText){
                    util.execFunc(opt.success,doc.body.innerText);
                    clearInterval(timer);
                    $iframe.remove();
                }
            }
        }, 500);
    };
    $iframe.on('load',load);
    $iframe.attr('src',/^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank');
    $('body').append($iframe);
}

/**
 * 获取iframe的文档对象
 * @param frame
 * @returns {*}
 */
function getDoc(frame) {
    var doc = null;
    // IE8 cascading access check
    try {
        if (frame.contentWindow) {
            doc = frame.contentWindow.document;
        }
    } catch(err) {
        // IE8 access denied under ssl & missing protocol
        console.log('cannot get iframe.contentWindow document: ' + err);
    }

    if (doc) { // successful getting content
        return doc;
    }

    try { // simply checking may throw in ie8 under ssl or mismatched protocol
        doc = frame.contentDocument ? frame.contentDocument : frame.document;
    } catch(err) {
        // last attempt
        console.log('cannot get iframe.contentDocument: ' + err);
        doc = frame.document;
    }
    return doc;
}
/**
 * 轮播图
 */
function LBT(opt){
    this.init(opt);
}

LBT.prototype = {
    init:function(opt){
        this.initOption(opt);
        this.startMove();
    },
    initOption:function(opt){
        var target = opt.target;
        var default_option = {
            index:0,
            interval:3000,
            moveTime:500,
            width:opt.target.offsetWidth
        };
        opt.itemLength = opt.target.children.length;
        this.opt = util.extend(default_option,opt);
        this.state = 0;
        this.moveing = false;
        opt.target.lbt = this;
        this.$elem = $(opt.target);
    },
    startMove:function(){
        var opt = this.opt;
        this.$elem.children().eq(opt.index).css('display','block');
        util.execFunc(opt.onSelect,opt.index);
        this.start();
    },
    stop:function(){
        clearTimeout(this.timer);
        this.state = 0;
    },
    start:function(){
        var _this = this;
        clearTimeout(this.timer);
        this.timer = setTimeout(function(){
            var index = _this.opt.index + 1;
            var isRight = null;
            if(index == _this.opt.itemLength){
                index = 0;
                isRight = true;
            }
            _this.tab(index,isRight);
        },this.opt.interval);
        this.state = 1;
    },
    tab:function(index,isRight){
        if(this.moveing || index == this.opt.index){
            return;
        }
        clearTimeout(this.timer);
        clearInterval(this.moveTimer);
        var opt = this.opt;
        var $elem = this.$elem;
        var box = opt.target;
        var $childs = $elem.children();
        var $oldElem = $childs.eq(opt.index);
        var $newElem = $childs.eq(index);
        var w = opt.width;
        isRight = util.isBoolean(isRight) ? isRight : index > opt.index;
        var left = (isRight ? 1 : -1) * w;
        $newElem.css({
            left:left + 'px',
            display:'block'
        });
        var speed = (w / opt.moveTime * 30) * (isRight ? -1 : 1);
        util.execFunc(opt.onSelect,index);
        var _this = this;
        var timer = setInterval(function(){
            var ool = $oldElem[0].offsetLeft;
            var onl = $newElem[0].offsetLeft;
            var nol = ool + speed;
            var nnl = onl + speed;
            if(speed > 0 && nnl >= 0 || speed < 0 && nnl <= 0){
                clearInterval(timer);
                _this.state && _this.start();
                _this.moveing = false;
                nnl = 0;
                $oldElem.css('display','none');
            }
            $oldElem.css('left',nol + 'px');
            $newElem.css('left',nnl + 'px');
        },30);
        this.moveing = true;
        this.moveTimer = timer;
        opt.index = index;
    }
};

/**
 * 按顺序加载图片
 * @param option
 * 参数配置有：
 * list         表示处理的图片数组
 * imgLoad      每张图片加载完成调用
 * imgError     每张图片加载失败调用
 * success      图片全部加载好调用
 * limit        每次最大加载数量
 */
function LoadImgList(option){
    this.init(option);
}
LoadImgList.prototype = {
    init:function(option){
        var opt = {
            limit:3,
            list:[],
            interval:30
        };
        util.extend(opt,option);
        var imgLoad = opt.imgLoad;
        var imgError = opt.imgError;
        var list = opt.list;
        list = util.isArray(list) ? list : util.toArray(list);
        var queue = new util.Queue({
            list:list,
            execFunc:function(img,cb){
                var $img = $(img);
                if($img.prop('src')){
                    cb();
                }else{
                    var src = $img.attr('dsrc');
                    setTimeout(function(){
                        if(!img.complete){
                            img.src = null;
                        }
                    },6000);
                    $img.on('load',function(){
                        util.execFunc(imgLoad,this);
                        cb();
                    }).on('error',function(){
                        util.execFunc(imgError,this);
                    }).attr('src',src);
                }
            },
            interval:opt.interval,
            limit:opt.limit
        });
        queue.start();
        this.queue = queue;
        this.opt = opt;
    },
    load:function(){
        this.queue.start();
    },
    add:function(list){
        list = util.isArray(list) ? list : util.toArray(list);
        list.forEach(function(item){
            this.opt.list.push(item);
        },this);
    }
};

/**
 * ie8的事件名称过滤
 * @param type
 * @returns {*}
 */
function filterEventTypeForIE8(type){
    var config = {};
    return config[type] || type;
}

/**
 * 表单取值赋值方法
 * @param opt
 * @returns {{}}
 */
function formData(opt){
    var default_opt = {
        defaultFunc:function(value){
            return value == null ? '' : value;
        },
        filter:window,
        list:[],
        field:'vname',
        filterField:'filter'
    };
    opt = util.extend(default_opt,opt);
    var result = {};
    var data = opt.data;
    $(opt.list).forEach(function(elem){
        var $elem = $(elem);
        var nodeName = $elem.getNodeName();
        var eleOpFunc = nodeName == 'INPUT' || nodeName == 'TEXTAREA' ? 'val' : 'html';
        var name = $elem.attr(opt.field);
        var func = opt.filter[$elem.attr(opt.filterField)];
        if(typeof func != 'function'){
            func = opt.defaultFunc;
        }
        if(name){
            if(data){
                $elem[eleOpFunc](func(data[name]));
            }else{
                result[name] = $elem[eleOpFunc]();
            }
        }
    });
    return result;
}


/**
 * 分页组件
 * @param options
 * 参数有： pageSize   每页记录数
 *          pageNum     默认选中第几页（不过要在length范围内）
 *          length      最多显示多少按钮（不包括上一页下一页）
 *          total       数据总数（计算最大页数用到）
 *          onselect    切换页数时调用，参数为当前页码以及配置参数
 */
function Paging(options){
    var target = options.target;
    if(target && target.nodeType == 1){
        this.setOpt(options);
        this.init();
    }else{
        throw new Error('参数中的target不是一个dom元素！');
    }
}
Paging.prototype = {
    init:function(options){
        this.initHtml();
        this.addEvent();
    },
    setOpt:function(options){
        var default_options = {
            pageSize:10,
            total:100,
            pageNum:1,
            itemLength:10,
            message:'共{maxNum}页',
            hasInput:true
        };
        options.$target = $(options.target);
        util.extend(this,default_options,options);
    },
    initHtml:function(){
        var $box = this.$target;
        var maxPageNum = this.getMaxNum();
        var len = Math.min(maxPageNum,this.itemLength);
        var message = this.getMessage();
        var html = '<span class="paging-btn paging-btn-prev">上一页</span><div class="paging-pagebox">';
        for(var i = 1;i <= len;i++){
            html += '<span class="paging-item '+ (i == 1 ? 'active' : '') +'">'+ i +'</span>';
        }
        html += '</div><span class="paging-btn paging-btn-next">下一页</span>';
        if(this.hasInput){
            html += '<input class="paging-input" type="text">';
        }
        html += '<span class="paging-message">'+ message +'</span>';
        $box.html(html);
        $box.addClass('paging-box paging-box-' + (this.position || 'right'));
        var $btns = $box.find('.paging-btn');
        this.$prevBtn = $btns.eq(0);
        this.$nextBtn = $btns.eq(1);
        this.$input = $box.find('.paging-input');
    },
    resetTotal:function(total){
        var opt = this.opt;
        if(this.total != total){
            this.total = total;
            var max = this.getMaxNum();
            var len = Math.min(max,this.itemLength);
            var html = '';
            var num = this.pageNum;
            for(var i = 1;i <= len;i++){
                html += '<span class="paging-item '+ (i == num ? 'active' : '') +'">'+ i +'</span>';
            }
            this.$prevBtn.next().html(html);
            this.updateBtnState();
            this.$input.next().html(this.getMessage());
        }
    },
    updateBtnState:function(){
        var $prevBtn = this.$prevBtn;
        var $nextBtn = this.$nextBtn;
        var maxPage = this.getMaxNum();
        if(this.pageNum == 1){
            $prevBtn.addClass('paging-diasbaled');
        }else{
            $prevBtn.removeClass('paging-diasbaled');
        }
        if(this.pageNum >= maxPage){
            $nextBtn.addClass('paging-diasbaled');
        }else{
            $nextBtn.removeClass('paging-diasbaled');
        }
    },
    getMaxNum:function(){
        return Math.ceil(this.total / this.pageSize) || 1;
    },
    getMessage:function(){
        var dic = {
            'total':this.total,
            'num':this.pageNum,
            'size':this.size,
            'maxNum':this.getMaxNum()
        };
        return this.message.replace(/\{[\w\W]*\}/g,function(match){
            var keyword = match.substring(1,match.length - 1);
            return dic[keyword] || '';
        });
    },
    addEvent:function(){
        var _this = this;
        this.$target.on('click',function(e){
            var $target = $(e.target);
            if($target.hasClass('paging-btn') && !$target.hasClass('paging-diasbaled')){
                var num = $(this).find('.active').html().toNum();
                _this.select(num + ($target.hasClass('paging-btn-next') ? 1 : -1));
            }else if($target.hasClass('paging-item')){
                _this.select($target.html().toNum());
            }
        });
        this.$input.on('keydown',function(e){
            var filterCodes = [8,37,39];
            var keyCode = e.keyCode;
            if(filterCodes.indexOf(keyCode) == -1 && !(keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 105)){
                wt.preventDefault(e);
            }
        }).on('keyup',function(e){
            var v = this.value.toNum();
            var max = _this.getMaxNum();
            if(v > max){
                v = max;
                this.value = v;
            }
            if(e.keyCode == 13){
                _this.select(v);
            }
        });
    },
    select:function(num){
        this.pageNum = num;
        var $target = this.$target;
        var len = this.itemLength;
        var maxPageNum = this.getMaxNum();
        var halfLen = Math.floor(len / 2);
        var extNum = num - halfLen;
        if(num <= halfLen + 1){
            extNum = 1;
        }else if(num > maxPageNum - halfLen){
            extNum = maxPageNum - len + 1;
        }
        $target.find('.paging-item').forEach(function(item,index){
            var $item = $(item);
            var n = extNum + index;
            $item.html(n);
            if(n == num){
                $item.addClass('active');
            }else{
                $item.removeClass('active');
            }
        });
        this.updateBtnState();
        util.execFunc.call(this,this.onSelect,num,this.pageSize);
    },
    reload:function(){
        util.execFunc.call(this,this.onSelect,this.pageNum,this.pageSize);
    }
};


function Datagrid(options){
    var target = options.target;
    if(!target){
        throw new TypeError("target is null or not defined");
    }
    this.target = target;
    this.init(options);
}
Datagrid.prototype = {
    init:function(options){
        this.setOption(options);
        this.setField();
        this.initHtml();
        this.initPaging();
        this.initEvent();
    },
    initHtml:function(){
        var opt = this.opt;
        var target = this.target;
        var columns = opt.columns;
        var headerHtml = '';
        columns.forEach(function(tds){
            headerHtml += '<tr class="w-datagrid-title">';
            tds.forEach(function(td){
                var width = td.width || 'auto';
                var colspan = td.colspan || 1;
                var rowspan = td.rowspan || 1;
                var title = td.title || '';
                var align = td.halign || 'left';
                headerHtml += '<td align="'+ align +'" width="'+ width +'" colspan="'+ colspan +'" rowspan="'+ rowspan +'"><div class="w-datagrid-div">'+ title +'</div></td>';
            });
            headerHtml += '</tr>';
        });
        target.innerHTML = '<div class="w-datagrid-header"><div class="fit">' +
        '<table class="w-datagrid-table">'+ headerHtml +'</table></div>' +
        '</div><div class="w-datagrid-body">' +
        '<table class="w-datagrid-table"><thead>'+ headerHtml + '</thead><tbody></tbody></table>' +
        '</div><div class="w-datagrid-paging"></div>';
        target.addClass('w-datagrid-wrap');
    },
    initPaging:function(){
        var opt = this.opt;
        if(opt.pagination){
            var _this = this;
            var target = this.target.querySelector('.w-datagrid-paging');
            var paging = new Paging({
                target:target,
                total:300,
                onSelect:function(num,size,opt){
                    var param = opt.param;
                    param.page = num;
                    param.size = size;
                    _this.loadData();
                },
                defaultClick:false
            });
            this.resize();
            paging.select(1);
            this.paging = paging;
        }else{
            this.resize();
            this.loadData();
        }
    },
    setOption:function(options){
        var default_options = {
            param:{}
        };
        this.opt = util.extend(true,{},default_options,options);
    },
    resize:function(){
        var target = this.target;
        var opt = this.opt;
        if(opt.width){
            target.css('width',parseInt(opt.width) + 'px');
        }
        if(opt.height != 'auto'){
            var allH = opt.height ? parseInt(opt.height) : target.parentNode.offsetHeight;
            var body = target.querySelector('.w-datagrid-body');
            var h = allH - body.prev().offsetHeight - body.next().offsetHeight - 1; //这里的1 是：最外层2px的边框减去body-1px的marginBottom
            body.css('height',h + 'px');
        }
    },
    initEvent:function(){
        var target = this.target;
        var body = target.querySelector('.w-datagrid-body');
        body.bind('scroll',function(ev){
            var e = ev || event;
            var target = e.target || e.srcElement;
            var ol = target.oldScrollLeft || 0;
            var cl = target.scrollLeft;
            if(cl != ol){
                var header = target.prev().children[0];
                header.scrollLeft = cl;
                target.oldScrollLeft = cl;
            }
        });
    },
    setField:function(){
        this.fields = this.getFieldsFunc(0);
    },
    getFieldsFunc:function(index,len){
        var result = [];
        var tds = this.opt.columns[index].slice(0);
        len = len || tds.length;
        for(var i = 0;i < len;i++){
            var td = tds.shift();
            var colspan = td.colspan || 1;
            if(colspan > 1){
                this.getFieldsFunc(index + 1,colspan).forEach(function(item){
                    result.push(item);
                });
            }else{
                result.push(td);
            }
        }
        return result;
    },
    reload:function(){
        this.loadData();
    },
    loadByParam:function(param){
        var oparam = this.opt.param;
    },
    loadData:function(){
        var rows = this.opt.data;
        var url = this.opt.url;
        var _this = this;
        if(rows){
            this.render(this.opt.data);
        }else if(url){
            $.ajax({
                url:url,
                data:this.opt.param || {},
                success:function(result){
                    _this.render(result);
                }
            })
        }
    },
    render:function(rows){
        var fields = this.fields;
        var html = '';
        rows.forEach(function(row,index){
            html += '<tr>';
            fields.forEach(function(item){
                var formatter = item.formatter;
                var value = row[item.field];
                if(util.isFunction(formatter)){
                    value = formatter(value,row,index)
                }
                html += '<td><div>'+ value +'</div></td>';
            });
            html += '</tr>';
        });
        this.target.querySelector('.w-datagrid-body tbody').innerHTML = html;
        var tables = this.target.querySelectorAll('.w-datagrid-table');
        var btable = tables[1];
        var scrollWidth = 17;
        if(btable.offsetHeight > btable.parentNode.offsetHeight){
            tables[0].parentNode.parentNode.css('paddingRight',scrollWidth + 'px');
        }
    },
    getPaging:function(){
        return this.paging;
    }
};


var wt = {
    isIE:isIE,
    isChrome:isChrome,
    isFirefox:isFirefox,
    isSafari:isSafari,
    isOpera:isOpera,
    LBT:LBT,
    $:$,
    //简单封装ajax
    ajax: $.ajax,
    //添加指定js文件
    addScript: function (src, win) {
        var w = win || window;
        var doc = w.document;
        var box = doc.createDocumentFragment();
        if (!util.isArray(src)) {
            src = [src];
        }
        src.forEach(function (item) {
            var s = doc.createElement('script');
            s.src = item;
            box.appendChild(s);
        });
        doc.querySelector('head').appendChild(box);
    },
    //获取url上数据
    getQueryString: function (name, win) {
        var w = win || window;
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var search = w.location.search.substr(1);
        var match = search.match(reg);
        return match && decodeURIComponent(match[2]);
    },
    /**
     * 添加active类
     * @param ele   元素
     * @param bol   是否删除兄弟节点的active类
     */
    addActive:function(ele,bol){
        var $ele = $(ele);
        $ele.addClass('active');
        if(bol !== false){
            $ele.siblings().removeClass('active');
        }
    },
    /**
     * 取消冒泡
     * @param e
     */
    stopPropagation:$.stopPropagation,
    /**
     * 取消默认事件
     * @param e
     */
    preventDefault:$.preventDefault,
    /**
     * 表单取值赋值方法
     * @returns {{}}
     */
    formData:formData,
    /**
     * 表单ajax提交
     */
    ajaxSubmit:ajaxSubmit,
    //本地图片预览
    previewImg: function (opt) {
        var $input = $(opt.input);
        var $div = $(opt.target);
        $input.on('change', function () {
            if (window.FileReader) {
                var file = this.files[0];
                var fileReader = new FileReader();
                fileReader.onload = function (ev) {
                    var target = ev.target || ev.srcElement;
                    $div.css({
                        background: 'url("' + target.result + '") left center no-repeat',
                        backgroundSize: '100% 100%'
                    });
                };
                fileReader.readAsDataURL(file);
            } else {
                $div[0].style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true,src=' + input.value + ',sizingMethod=scale)';
            }
            util.execFunc(opt.onChange,this);
        });
    },
    /**
     * 弹窗方法
     * @param option
     */
    dialog:function(option){
        var closeFunc = function(){
            var $container = $(this).closest('.mask-container');
            if($container.length){
                $container.remove();
                util.execFunc(option.onClose);
            }
        };
        var defaultOpt = {
            id:'w_win_dialog_'+ (+new Date()),
            title:'默认标题',
            width:400,
            height:300,
            modal:true,
            toTop:true,
            tools:[],
            buttons:[
                {
                    iconCls:'icon-close',
                    text:'关闭',
                    handler:closeFunc
                }
            ],
            content:'',
            btnAlign:'right'
        };
        var opt = util.extend(defaultOpt,option);
        opt.tools.push({
            iconCls:'icon-win-close',
            handler:closeFunc
        });
        var toolHtml = '';
        var btnHtml = '';
        opt.tools.forEach(function(item){
            toolHtml += '<span class="prompt-tool prompt-handler '+ item.iconCls +'"></span>';
        });
        opt.buttons.forEach(function(item){
            btnHtml += '<a class="w-btn prompt-handler"><i class="iconfont '+ (item.iconCls ? item.iconCls : 'iconfont-hide') +'"></i><span>'+ item.text +'</span></a>';
        });
        var html = '<div class="mask-container"><div class="mask-shadow"></div><div class="prompt-box" style="width:'
            + opt.width + 'px;height:'
            + opt.height + 'px;margin:-'
            + opt.height/2 + 'px 0 0 -'
            + opt.width/2 + 'px"><div class="prompt-header"><span>'
            + opt.title +'</span><div class="prompt-toolbox">'
            + toolHtml +'</div></div><div class="prompt-body fit" id="'
            + opt.id +'">'
            + opt.content +'</div><div class="prompt-btnbox" style="text-align:'+ opt.btnAlign +'">'
            + btnHtml +'</div></div></div>';
        var $container = $(html);
        $('body').append($container);
        $container.on('click',function(e){
            var $target = $(e.target);
            var $btn = $target.closest('.prompt-handler');
            if($btn.length){
                var btnType = $btn.hasClass('.prompt-tool') ? 'tools' : 'buttons';
                opt[btnType][$btn.index()].handler.call($btn[0]);
            }
        });
    },
    /**
     * 打开全屏模式
     * @param target    全屏的目标元素
     */
    fullScreen:function(target){
        target = target || document.body;
        var requestMethod = target.requestFullScreen || //W3C
            target.webkitRequestFullScreen ||    //Chrome等
            target.mozRequestFullScreen || //FireFox
            target.msRequestFullscreen; //IE11
        if (requestMethod) {
            requestMethod.call(target);
        }else if (typeof window.ActiveXObject !== 'undefined') {//for Internet Explorer
            try{
                var wscript = new ActiveXObject('WScript.Shell');
                wscript.SendKeys('{F11}');
            }catch(e){
                this.alert('请先将本站加入信任站点，并允许ActiveX控件交互，再进行全屏操作！');
            }
        }
    },
    /**
     * 退出全屏
     */
    exitFullScreen:function(){
        var exitMethod = document.exitFullscreen || //W3C
            document.mozCancelFullScreen ||    //FireFox等
            document.webkitExitFullscreen || //Chrome
            document.msExitFullscreen; //IE11等
        if (exitMethod) {
            exitMethod.call(document);
        }else if (typeof window.ActiveXObject !== 'undefined') {//for Internet Explorer
            try{
                var wscript = new ActiveXObject('WScript.Shell');
                wscript.SendKeys('{F11}');
            }catch(e){
                this.alert('请先将本站加入信任站点，并允许ActiveX控件交互，再进行全屏操作！');
            }
        }
    },
    /**
     * 获取系统位数
     * @returns {*}
     */
    getCPU:function() {
        var agent = navigator.userAgent.toLowerCase();
        if(agent.indexOf("win64") >= 0 || agent.indexOf("wow64") >= 0){
            return "x64";
        }
        return navigator.cpuClass;
    },
    /**
     * 弹窗提示信息
     * @param info  内容
     */
    alert: function (info) {
        var opt = {
            title:'提示',
            width:300,
            height:165,
            btnCenter:true,
            buttons:[
                {
                    iconCls:'icon-ok',
                    text:'确定',
                    handler:function(){
                        $(this).closest('.mask-container').remove();
                    }
                }
            ],
            content:'<div class="prompt-content fit"><div class="prompt-icon"></div><div class="prompt-text">'+ info +'</div></div>'
        };
        this.dialog(opt);
    },
    /**
     * html节点加载完成执行
     * @param fn
     * @constructor
     */
    DOMReady:function(fn){
        if(document.readyState == 'complete'){
            fn();
        }else if(document.addEventListener){
            document.addEventListener('DOMContentLoaded',fn,false);
        }else if(document.attachEvent){
            ieDOMReady(fn);
        }
    },
    /**
     * 获取页面最外层滚动条高度
     * @returns {*}
     */
    scrollTop:function(v){
        if(v != null){
            v = v.toString().toNum();
            document.body.scrollTop = v;
            document.documentElement.scrollTop = v;
        }else{
            return document.documentElement.scrollTop || document.body.scrollTop;
        }
    },
    bindDrawRect:function(opt){
        var $target = $(opt.target);
        var target = $target[0];
        $target.on('mousedown',drawRectMousedown);
        target.onselectstart = function(){
            return false;
        };
        target.drawRectOpt = opt;
    },
    unbindDrawRect:function(opt){
        var $target = $(opt.target);
        var target = $target[0];
        $target.off('mousedown',drawRectMousedown);
        delete target.drawRectOpt;
    },
    /**
     * 逐个加载图片，需要加图片地址塞到img的dsrc属性上
     * 然后将图片加入列表即可，最后调用render加载图片
     */
    LoadImgList:LoadImgList,
    /**
     * 显示处理中遮罩层，提示用户以及防止重复点击
     * @param msg   提示的信息
     */
    inProcess:function(msg){
        msg = msg || '&nbsp;';

        var html = '<div class="mask-container text-center process-box"><div class="mask-shadow"></div>' +
            '<div class="process-text">'+ msg + '</div>' +
            '<div class="inline-m fit-height"></div></div>';
        var $div = $(html);
        $('body').append($div);
    },
    /**
     * 删除所有处理中遮罩层
     */
    outProcess:function(){
        $('.process-box').remove();
    },
    /**
     * 分页组件
     */
    Paging:Paging,
    /**
     * 表格组件
     */
    Datagrid:Datagrid
};
util.extend(util,wt);