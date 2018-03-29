/**
 * Created by Administrator on 2018/1/12.
 */

var util = require('../util/util');

function $(selector){
    return new DomElement(selector);
}

module.exports = $;


// 创建构造函数
function DomElement(selector){
    // selector 本来就是 DomElement 对象，直接返回
    if(selector instanceof DomElement){
        return selector;
    }
    this.selector = selector;
    // 根据 selector 得出的结果（如 DOM，DOM List）
    var elemList = [];
    if(selector){
        if(selector.nodeType === 9 || selector.nodeType === 1){
            elemList = [selector];
        }else if (typeof selector === 'string'){
            selector = selector.trim();
            if(selector.charAt(0) === '<'){
                elemList = createElemByHTML(selector);
            }else{
                elemList = qsAll(selector);
            }
        }else{
            elemList = selector;
        }
    }
    for(var i = 0,len = elemList.length;i < len;i++){
        this[i] = elemList[i];
    }
    this.length = len;
}
var rnoInnerhtml = /<(?:script|style|link)/i;
// 修改原型
DomElement.prototype = {
    forEach:function(fn,_this){ //遍历
        _this = _this || this;
        arrForEach(this,fn,_this);
        return this;
    },
    clone:function(deep){   //克隆
        var cloneList = [];
        this.forEach(function(elem){
            cloneList.push(elem.cloneNode(!!deep));
        });
        return $(cloneList);
    },
    // 获取第几个元素
    eq:function(index){
        var length = this.length;
        if(length){
            if (index >= length) {
                index = index % length;
            }
            while(index < 0){
                index += length;
            }
        }
        return $(this[index]);
    },
    // 第一个
    first:function(){
        return this.eq(0);
    },
    // 最后一个
    last:function(){
        return this.eq(this.length - 1);
    },
    // 绑定事件
    on:function(type,fn,bol){
        // selector 不为空，证明绑定事件要加代理
        var types = type.split(/\s+/);
        return this.forEach(function(elem){
            types.forEach(function(type){
                var eventList = elem.eventList;
                if (!eventList) {
                    elem.eventList = eventList = {};
                }
                var funcList = eventList[type];
                if(!funcList){
                    eventList[type] = funcList = [];
                }
                if(elem.addEventListener){
                    funcList.push(fn);
                    elem.addEventListener(type, fn, bol);
                }else{
                    var func = function (e) {
                        e = e || event;
                        e.target = e.target || e.srcElement;
                        e.deltaY = -e.wheelDelta;
                        fn.call(elem,e);
                    };
                    func.execFunc = fn;
                    funcList.push(func);
                    elem.attachEvent('on' + filterEventTypeForIE8(type), func);
                }
            });
        });
    },
    // 取消事件绑定
    off:function(type,fn){
        return this.forEach(function(elem){
            var eventList = elem.eventList;
            var funcList = eventList && eventList[type];
            if(funcList){
                if(fn){
                    if (elem.removeEventListener) {
                        elem.removeEventListener(type,fn);
                        funcList.remove(fn);
                    } else {
                        arrForEach(funcList,function(targetfn,i){
                            if (targetfn.execFunc == fn) {
                                elem.detachEvent('on' + filterEventTypeForIE8(type), targetfn);
                                funcList.splice(i, 1);
                                return false;
                            }
                        });
                    }
                }else{
                    funcList.forEach(function(fn){
                        this.off(type,fn);
                    }, this);
                }
            }
        },this);
    },
    // 获取/设置 属性
    attr: function(key, val) {
        if (val == null) {
            return this[0] ? this[0].getAttribute(key) : '';
        } else {
            return this.forEach(function (elem) {
                elem.setAttribute(key, val);
            });
        }
    },
    removeAttr:function(key){
        return this.forEach(function (elem) {
            elem.removeAttribute(key);
        });
    },
    prop: function(key, val) {
        if (val == null) {
            return this[0] ? this[0][key] : '';
        } else {
            return this.forEach(function (elem) {
                elem[key] = val;
            });
        }
    },
    hasClass:function(className){
        var bol = false;
        arrForEach(this,function(elem){
            if(hasClass(elem,className)){
                bol = true;
                return false;
            }
        });
        return bol;
    },
    // 添加 class
    addClass: function(className) {
        if (!className) {
            return this;
        }
        return this.forEach(function (elem) {
            className.split(/\s+/).forEach(function(className){
                if(!hasClass(elem,className)){
                    elem.className += ' ' + className;
                }
            });
        });
    },
    // 删除 class
    removeClass: function(className) {
        if (!className) {
            return this;
        }
        return this.forEach(function (elem) {
            className.split(/\s+/).forEach(function(className){
                var re = new RegExp('\\s+' + className + '\\s+');
                elem.className = (' ' + elem.className + ' ').replace(re, ' ').trim();
            });
        });
    },
    toggleClass:function(className){
        return this.forEach(function(elem){
            var $elem = $(elem);
            if($elem.hasClass(className)){
                $elem.removeClass(className);
            }else{
                $elem.addClass(className);
            }
        });
    },
    // 修改 css
    css: function css(key, val) {
        if(util.isString(key)){
            if(val == null){
                var elem = this[0];
                return elem ? elem.currentStyle ? elem.currentStyle[key] : getComputedStyle(elem, false)[key] : '';
            }else{
                this.forEach(function(elem){
                    elem.style[key] = val;
                });
            }
        }else{
            for (var attr in key) {
                if(key.hasOwnProperty(attr)){
                    this.css(attr, key[attr]);
                }
            }
        }
        return this;
    },
    getElemList:function(fn){
        var eleList = [];
        this.forEach(function(elem,i){
            var list = fn.call(this,elem,i);
            if(list){
                if(list.length == null){
                    list = [list];
                }
                var tElem;
                for(var n = 0,len = list.length;n < len;n++){
                    tElem = list[n];
                    if(eleList.indexOf(tElem) == -1){
                        eleList.push(tElem);
                    }
                }
            }
        });
        return eleList;
    },
    next:function(selector){
        var eleList = this.getElemList(function(elem){
            var next = elem.nextSibling;
            while(next && (next.nodeType != 1 || !checkElem(next,selector))){
                next = next.nextSibling;
            }
            return next;
        });
        return $(eleList);
    },
    prev:function(){
        var eleList = this.getElemList(function(elem){
            var prev = elem.previousSibling;
            while(prev && (prev.nodeType != 1 || !checkElem(prev,selector))){
                prev = prev.previousSibling;
            }
            return prev;
        });
        return $(eleList);
    },
    index:function(){
        var index = 0;
        var prev = this[0];
        if(prev == null){
            return -1;
        }
        while (prev = prev.previousSibling) {
            if(prev.nodeType == 1){
                index++;
            }
        }
        return index;
    },
    // 显示
    show: function() {
        return this.css('display', 'block');
    },
    // 隐藏
    hide: function() {
        return this.css('display', 'none');
    },
    parent: function() {
        var elemList = this.getElemList(function(elem){
            return elem.parentNode;
        });
        return $(elemList);
    },
    // 获取子节点
    children:function(selector){
        var elemList = this.getElemList(function(elem){
            return elem.children;
        });
        return $(elemList).filter(selector);
    },
    // 获取子节点（包括文本节点）
    childNodes: function() {
        var elemList = this.getElemList(function(elem){
            return elem.childNodes;
        });
        return $(elemList);
    },
    siblings: function (selector) {
        var elemList = this.getElemList(function(elem){
            var temp = [];
            arrForEach(elem.parentNode.children,function(sibElem){
                if (temp.indexOf(sibElem) == -1 && sibElem != elem && sibElem.nodeType == 1 && checkElem(sibElem,selector)) {
                    temp.push(sibElem);
                }
            });
            return temp;
        });
        return $(elemList);
    },
    // 增加子节点
    append: function(children) {
        return this.forEach(function (elem) {
            var $children = $(children);
            $children.forEach(function (child) {
                elem.appendChild(child);
            });
            $._execScript($children);
        });
    },
    prepend:function($children){
        return this.forEach(function (elem) {
            var $children = $(children);
            $children.forEach(function (child) {
                var firstChild = elem.children[0];
                if(firstChild){
                    elem.insertBefore(child,firstChild);
                }else{
                    elem.appendChild(child);
                }
            });
            $._execScript($children);
        });
    },
    before:function(children){
        return this.forEach(function (elem) {
            var $children = $(children);
            $children.forEach(function (child) {
                elem.parentNode.insertBefore(child,elem);
            });
            $._execScript($children);
        });
    },
    after:function(children){
        return this.forEach(function (elem) {
            var $elem = $(elem);
            var $next = $elem.next();
            if($next.length){
                $next.before(children);
            }else{
                $elem.parent().append(children);
            }
        });
    },
    // 移除当前节点
    remove: function() {
        return this.forEach(function (elem) {
            elem.parentNode.removeChild(elem);
        });
    },
    // 是否包含某个子节点
    isContain: function($child) {
        var elem = this[0];
        var child = $child[0];
        return elem && child ? elem.contains(child) : false;
    },
    // 尺寸数据
    getRect: function() {
        var elem = this[0];
        if(elem){
            var rect = elem.getBoundingClientRect();
            return {
                left:rect.left,
                top:rect.top,
                right:rect.right,
                bottom:rect.bottom,
                width:rect.width || rect.right - rect.left,
                height:rect.height || rect.bottom - rect.top
            };
        }
    },
    // 封装 nodeName
    getNodeName: function() {
        return this[0] ? this[0].nodeName : '';
    },
    // 从当前元素查找
    find: function(selector) {
        var elemList = this.getElemList(function(elem){
            return elem.querySelectorAll(selector);
        });
        return $(elemList);
    },
    bind:function(){
        this.on.apply(this,arguments);
    },
    unbind:function(){
        this.off.apply(this,arguments);
    },
    // 获取当前元素的 text
    text: function(val) {
        if(val == null) {
            return this[0] ? this[0].innerText : '';
        }else {
            // 设置 text
            return this.forEach(function (elem) {
                elem.innerText = val;
            });
        }
    },

    // 获取 html
    html: function(value) {
        if(value == null) {
            return this[0] ? this[0].innerHTML : '';
        }else if(util.isString(value) && value.charAt(0) !== '<' || util.isNumber(value) || util.isBoolean(value)){
            return this.forEach(function(elem){
                elem.innerHTML = value;
            });
        }else{
            return this.empty().append(value);
        }
    },
    // 获取 value
    val: function(value) {
        if(value == null){
            return this[0] ? this[0].value : '';
        }else{
            return this.forEach(function (elem) {
                elem.value = value;
            });
        }
    },
    empty:function(){
        return this.forEach(function(elem){
            elem.innerHTML = '';
        });
    },
    filter:function(selector){
        var elemList = this.getElemList(function(elem){
            return checkElem(elem,selector) ? elem : null;
        });
        return $(elemList);
    },
    offset:function(){
        var elem = this[0];
        if(elem){
            return {
                left:elem.offsetLeft,
                top:elem.offsetTop
            }
        }
    },
    closest:function(selector){
        var elemList = this.getElemList(function(elem){
            while(elem){
                if(checkElem(elem,selector)){
                    break;
                }
                elem = elem.parentNode;
            }
            return elem;
        });
        return $(elemList);
    },
    data:function(name,value){
        if(value == null){
            var elem = this[0];
            return elem ? cacheData.getData(elem,name) : '';
        }else{
            return this.forEach(function(elem){
                cacheData.setData(elem,name,value);
            });
        }
    },
    removeData:function(name){
        return this.forEach(function(elem){
            cacheData.removeData(elem,name);
        });
    },
    dragSort:function(){
        this.off('mousedown').mousedown(function(e){
            var $this = $(this);
            var $target = $(e.target);
            var $item = $target.closest('.dragsort-elem');
            var $items = $item.siblings();
            if(e.which !== 1 || $item.length === 0 || $items.length === 0 || $target.closest('.nodrag-elem').length){
                return;
            }
            var ox = e.clientX;
            var oy = e.clientY;
            var dx,dy,rect;
            var rects = [];
            var isDrag = false;
            function mousemove(e){
                var cx = e.clientX;
                var cy = e.clientY;
                if(!isDrag && (cy != oy || cx != ox)){
                    isDrag = true;
                    rect = $item[0].getBoundingClientRect();
                    dx = ox - rect.left;
                    dy = oy - rect.top;
                    $item.css({
                        position:'absolute',
                        zIndex:500,
                        left:rect.left + 'px',
                        top:rect.top + 'px'
                    });
                    $items.forEach(function(elem,i){
                        var rect = elem.getBoundingClientRect();
                        var width = rect.width || rect.right - rect.left;
                        var $elem = $(elem);
                        var th = $elem.css('marginBottom').toNum();
                        var y = rect.top - th / 2;
                        var x = rect.left + width / 2;
                        var index = rects.indexOfFunc(function(item){
                            return item[0].y == y;
                        })
                        var data = {
                            y:y,
                            x:x,
                            i:i
                        };
                        if(index == -1){
                            rects.push([data]);
                        }else{
                            rects[index].push(data);
                        }
                    });
                    $('body').append($item);
                    mousemove(e);
                }else if(isDrag){
                    $item.css({
                        left:cx - dx + 'px',
                        top:cy - dy + 'px'
                    });
                    var ary = rects[0];
                    for(var i = 0;i < rects.length;i++){
                        if(rects[i][0].y < cy){
                            ary = rects[i];
                        }
                    }
                    var r;
                    var targetIndex = ary[0].i;
                    var isLineHead = true;
                    for(i = 0;i < ary.length;i++){
                        r = ary[i];
                        if(r.x < cx){
                            isLineHead = false;
                            targetIndex = r.i;
                        }
                    }
                    $items.removeClass('drag-active');
                    $items.removeClass('drag-active-left');
                    if(isLineHead){
                        $items.eq(targetIndex).addClass('drag-active-left');
                    }else{
                        $items.eq(targetIndex).addClass('drag-active');
                    }
                }
            }
            function mouseup(e){
                if(isDrag){
                    var $target = $items.filter('.drag-active');
                    $item.css({
                        left:0,
                        top:0,
                        position:'relative',
                        zIndex:'auto'
                    });
                    if($target.length){
                        $target.after($item).removeClass('drag-active');
                    }else{
                        $target = $items.filter('.drag-active-left');
                        if($target.length){
                            $target.before($item).removeClass('drag-active-left');
                        }else{
                            $items.parent().append($item);
                        }
                    }
                }
                $('body').off('mousemove',mousemove).off('mouseup',mouseup);
            }
            $('body').mousemove(mousemove).mouseup(mouseup);
        });
        this[0].onselectstart = function(){
            return false;
        };
        $('body')[0].ondragstart = function(){
            return false;
        };
    },
    /**
     * 拖拽触发方法
     * @param e
     */
    drag:function() {
        return this.off('mousedown').mousedown(function(e){
            var $this = $(this);
            var dx = e.clientX - this.offsetLeft + $this.css('marginLeft').toNum();
            var dy = e.clientY - this.offsetTop + $this.css('marginTop').toNum();
            function mousemove(e){
                $this.css({
                    left: e.clientX - dx + 'px',
                    top: e.clientY - dy + 'px'
                });
            }
            function mouseup(e){
                $('body').off('mousemove', mousemove).off('mouseup', mouseup);
            }
            $('body').mousemove(mousemove).mouseup(mouseup);
        });
    },
    /**
     * 缩放方法
     * @param e
     */
    zoom:function(){
        return this.off('wheel').wheel(function(e){
            var $this = $(this);
            var rect = $this.getRect();
            var dx = e.clientX - this.offsetLeft;
            var dy = e.clientY - this.offsetTop;
            var oLeft = this.offsetLeft - $this.css('marginLeft').toNum();
            var oTop = this.offsetTop - $this.css('marginTop').toNum();
            var scale = (e.wheelDelta == null ? e.deltaY < 0 : e.wheelDelta > 0) ? 1.2 : 1 / 1.2;
            $this.css({
                width:rect.width * scale + 'px',
                height:rect.height * scale + 'px',
                left:oLeft + dx * (1 - scale) + 'px',
                top:oTop + dy * (1 - scale) + 'px'
            });
            $.preventDefault(e);
        });
    },
    /**
     * 放大镜效果
     */
    magnify:function(opt){
        var defaultOpt = {
            offset:10,
            scale:8
        };
        this.data('option',util.extend(defaultOpt,opt));
        return this.off('mouseenter').mouseenter(function(e){
            var $this = $(this);
            var rect = $this.getRect();
            var width = rect.width;
            var height = rect.height;
            var opt = $this.data('option');
            var src = $this.find('img').attr('src');
            if(!src || opt.enable && opt.enable.call(this,src)){
                return;
            }
            var $slider = $this.find('.magnify-slider');
            if($slider.length === 0){
                $slider = $('<div class="magnify-slider"></div>');
                $this.append($slider);
            }
            var $viewBox = $('.magnify-view');
            var $body = $('body');
            if($viewBox.length === 0){
                $viewBox = $('<div class="magnify-view"><img class="magnify-img"></div>');
                $body.append($viewBox);
            }
            var $viewImg = $viewBox.find('img').attr('src',src);
            var render = function(e){
                var l = e.clientX - rect.left - sliderWidth / 2;
                var t = e.clientY - rect.top - sliderWidth / 2;
                l = Math.min(Math.max(l,0),width - sliderWidth);
                t = Math.min(Math.max(t,0),height - sliderWidth);
                $slider.css({
                    left:l + 'px',
                    top:t + 'px'
                });
                $viewImg.css({
                    left: -l * scale + 'px',
                    top: -t * scale + 'px'
                });
            };
            var sliderWidth = $slider.css('width').toNum();
            var scale = opt.scale;
            var offset = opt.offset;
            var boxLeft = rect.right + 10;
            var boxWidth = sliderWidth * scale;
            if(rect.right + boxWidth + offset > innerWidth){
                boxLeft = rect.left - offset - boxWidth;
            }
            var boxTop = rect.top;
            if(boxTop + boxWidth > innerHeight){
                boxTop = rect.bottom - boxWidth;
            }
            $viewBox.css({
                left:boxLeft + 'px',
                top:boxTop + 'px',
                width:boxWidth + 'px',
                height:boxWidth + 'px'
            });
            $viewImg.css({
                width:width * scale + 'px',
                height:height * scale + 'px'
            });
            render(e);
            $slider.show();
            $viewBox.show();
            var mouseleave = function(){
                $slider.hide();
                $viewBox.hide();
                $('body').off('mousemove',render);
                $this.off('mouseleave',mouseleave);
            };
            $body.on('mousemove',render);
            $this.on('mouseleave',mouseleave);
        });
    },
    paste(option){
        this.off('paste').on('paste',e => {
            let {clipboardData,target} = e;
            let item = clipboardData.items[0];
            let {success} = $(target).data('pasteOption') || {};
            if(item && item.type.indexOf('image') !== -1){
                let reader = new FileReader();
                let file = item.getAsFile();
                reader.onload = (e)=>{
                    wt.execFunc.call(target,success,e.target.result);
                };
                reader.readAsDataURL(file);
            }else{
                wt.execFunc.call(target,success,clipboardData.getData('text'));
            }
        }).data('pasteOption',option);
    },
    fileDrop(option){
        this.off('drop').on('drop',e => {
            e.preventDefault();
            let {dataTransfer,target} = e;
            let {files} = dataTransfer;
            let {success} = $(target).data('fileDropOption') || {};
            let q = new wt.Queue({
                list:Array.from(files),
                execFunc(file,cb){
                    let reader = new FileReader();
                    reader.onload = (e)=>{
                        let {result} = this;
                        if(!result){
                            result = [];
                            this.result = result;
                        }
                        result.push(e.target.result);
                        cb();
                    };
                    reader.readAsDataURL(file);
                },
                success(){
                    wt.execFunc.call(target,success,this.result);
                }
            });
            q.start();
        }).data('fileDropOption',option).on('dragover',e => {
            e.preventDefault();
        });
    }
};



util.extend($,{
    ajax: function (option) {
        var defaultOpt = {
            async:true,
            type:'get',
            headers:{
                'content-type':'application/x-www-form-urlencoded; charset=UTF-8'
            },
            processData:true,
            contentType:true
        };
        var opt = util.extend(defaultOpt,option);
        var x = new XMLHttpRequest();
        x.onreadystatechange = function () {
            if(x.readyState == 4){
                var data = x.responseText;
                if(x.status == 200){
                    try{
                        data = JSON.parse(data);
                    }catch(e){}
                    util.execFunc(opt.success,data);
                }else{
                    util.execFunc(opt.error, data);
                }
            }
        };
        x.onerror = function(e){
            util.execFunc(opt.error, x.responseText);
        };
        var data = opt.data;
        if(opt.processData && util.isObject(data)){
            var dataAry = [];
            for(name in data){
                if(data.hasOwnProperty(name)){
                    var value = data[name];
                    if(value !== undefined){
                        dataAry.push(name + '=' + value);
                    }
                }
            }
            data = dataAry.join('&');
            if(opt.type.toUpperCase() == 'GET'){
                opt.url += (opt.url.indexOf('?') != -1 ? '&' : '?') + data;
            }
        }
        x.open(opt.type,opt.url, opt.async);
        if (opt.responseType) {
            x.responseType = opt.responseType;
        }
        var name;
        var headers = opt.headers;
        for (name in headers) {
            if(headers.hasOwnProperty(name)){
                if(name !== 'content-type' || opt.contentType){
                    x.setRequestHeader(name, headers[name]);
                }
            }
        }
        if(opt.timeout){
            x.timeout = opt.timeout;
        }
        if(opt.ontimeout){
            x.ontimeout = opt.ontimeout;
        }
        x.send(data);
    },
    _execScript:function($node){
        $node = $node instanceof DomElement ? $node : $($node);
        $node.find('script').forEach(function(script){
            if(script.src){
                $.ajax({
                    url:script.src,
                    async:false,
                    success:function(data){
                        try{
                            eval(data);
                        }catch(e){}
                    }
                });
            }else{
                try{
                    eval(script.innerHTML);
                }catch(e){}
            }
        });
    },
    /**
     * 取消默认行为
     * @param e
     */
    preventDefault:function(e){
        if(e.preventDefault){
            e.preventDefault();
        }else{
            e.returnValue = false;
        }
    },
    /**
     * 取消冒泡
     * @param e
     */
    stopPropagation:function(e){
        if(e.stopPropagation){
            e.stopPropagation();
        }else{
            e.cancelBubble = true;
        }
    }
});

var eventNames = 'click dblclick mouseover mouseout mouseenter mouseleave mousedown mousemove mouseup keydown keyup wheel change';

eventNames.split(' ').forEach(function(eventName){
    DomElement.prototype[eventName] = function(fn){
        return fn == null ? this.forEach(function(elem){
            elem.click();
        }) : this.on(eventName,fn);
    };
});


function createElemByHTML(selector){
    var div = document.createElement('div');
    div.innerHTML = selector;
    var children = div.children;
    var result = [];
    for(var i = 0,len = children.length;i < len;i++){
        result.push(children[i]);
    }
    div = null;
    return result;
}

/**
 * ie8的事件名称过滤
 * @param type
 * @returns {*}
 */
function filterEventTypeForIE8(type){
    var config = {
        'wheel':'mousewheel'
    };
    return config[type] || type;
}

/**
 * 判断是否含有class
 * @param className
 * @param elem
 * @returns {boolean}
 */
function hasClass(elem,className){
    var re = new RegExp('\\s+' + className + '\\s+');
    var classStr = ' ' + elem.className + ' ';
    return re.test(classStr);
}

/**
 * 类数组遍历
 * @param ary
 * @param fn
 */
function arrForEach(ary,fn,_this){
    _this = _this || this;
    for(var i = 0,len = ary.length;i < len;i++){
        if(fn.call(_this,ary[i],i) === false){
            break;
        }
    }
}
/**
 * 合并
 */
function concat(first,second){
    var ol = first.length;
    for(var i = 0,len = second.length;i < len;i++){
        first[ol + i] = second[i];
    }
    first.length = ol + len;
}

var selectorExpr = /^(#([\w-]+)|(\w+)|\.([\w-]+))$/;
/**
 * 判断元素是否符合选择器
 * @param elem
 * @param selector
 * @returns {boolean}
 */
function checkElem(elem,selector){
    var match = selectorExpr.exec(selector);
    return selector ? match ? match[2] ? elem.id == match[2] : match[3] ? elem.nodeName == match[3].toUpperCase() : match[4] ? hasClass(elem,match[4]) : false : false : true;
}

/**
 * 数据存储中心
 * @type {{data: Array, getDataByElem: cacheData.getDataByElem, setData: cacheData.setData, getData: cacheData.getData, removeData: cacheData.removeData}}
 */
var cacheData = {
    data:[],
    getDataByElem:function(elem){
        var index = this.data.indexOfFunc(function(data){
            return data._target == elem;
        })
        return this.data[index];
    },
    setData:function(elem,name,value){
        var data = this.getDataByElem(elem);
        if(data){
            data.data[name] = value;
        }else{
            data = {
                _target:elem,
                data:{}
            };
            data.data[name] = value;
            this.data.push(data);
        }
    },
    getData:function(elem,name){
        var data = this.getDataByElem(elem);
        return data ? data.data[name] : '';
    },
    removeData:function(elem,name){
        var data = this.getDataByElem(elem);
        if(data){
            if(name == null){
                data.data = {};
            }else{
                delete data.data[name];
            }
        }
    }
}