(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"../util/util":6}],2:[function(require,module,exports){
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
},{"../$/$":1,"../util/util":6}],3:[function(require,module,exports){
/**
 * Created by Administrator on 2017/12/6.
 */

module.exports = {
    forEach: function (fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn != 'function') {
            throw new TypeError(fn + " is not a function");
        }
        var fn_this = arguments.length > 1 ? arguments[1] : this;
        for (var i = 0; i < this.length; i++) {
            fn.call(fn_this, this[i], i, this);
        }
    },
    reduce: function (fn, value) {
        if (!this.length) {
            return value;
        }
        if (value == undefined) {
            value = this[0];
        } else {
            value = fn(value, this[0], 0);
        }
        for (var i = 1; i < this.length; i++) {
            value = fn(value, this[i], i);
        }
        return value;
    },
    every: function (fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn != 'function') {
            throw new TypeError(fn + " is not a function");
        }
        var fn_this = arguments.length > 1 ? arguments[1] : this;
        for (var i = 0; i < this.length; i++) {
            if (!fn.call(fn_this, this[i], i, this)) {
                return false;
            }
        }
        return true;
    },
    some: function (fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn != 'function') {
            throw new TypeError(fn + " is not a function");
        }
        var fn_this = arguments.length > 1 ? arguments[1] : this;
        for (var i = 0; i < this.length; i++) {
            if (fn.call(fn_this, this[i], i, this)) {
                return true;
            }
        }
        return false;
    },
    map: function (fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn != 'function') {
            throw new TypeError(fn + " is not a function");
        }
        var fn_this = arguments.length > 1 ? arguments[1] : this;
        var array = [];
        for (var i = 0; i < this.length; i++) {
            array.push(fn.call(fn_this, this[i], i, this));
        }
        return array;
    },
    filter: function (fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn != 'function') {
            throw new TypeError(fn + " is not a function");
        }
        var fn_this = arguments.length > 1 ? arguments[1] : this;
        var array = [];
        for (var i = 0; i < this.length; i++) {
            if (fn.call(fn_this, this[i], i, this)) {
                array.push(this[i]);
            }
        }
        return array;
    },
    indexOf: function (value) {
        if (typeof value != 'undefined') {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == value) {
                    return i;
                }
            }
        }
        return -1;
    },
    indexOfFunc: function (fn) {
        for (var i = 0; i < this.length; i++) {
            if (typeof fn == 'function' ? fn(this[i]) : fn == this[i]) {
                return i;
            }
        }
        return -1;
    },
    remove: function (item) {
        for(var i = 0;i < this.length;i++){
            if(this[i] == item){
                this.splice(i, 1);
                break;
            }
        }
        return this;
    },
    toFieldObject:function(field){
        var target = {};
        this.forEach(function(item,i){
            target[item[field] || i] = item;
        });
        return target;
    }
};
},{}],4:[function(require,module,exports){
/**
 * Created by Administrator on 2017/12/6.
 */
module.exports = {
    toFormatString: function (str) {
        str = str || 'YYYY-MM-DD hh:mm:ss';
        var config = {
            Y: this.getFullYear(),
            M: this.getMonth() + 1,
            D: this.getDate(),
            h: this.getHours(),
            m: this.getMinutes(),
            s: this.getSeconds()
        };
        for(var char in config){
            var re = new RegExp(char + '+');
            str = str.replace(re,function(match){
                var v = config[char] + '';
                var d = match.length - v.length;
                if(d > 0){
                    v = new Array(d + 1).join('0') + v;
                }
                return v;
            });
        }
        return str;
    }
};
},{}],5:[function(require,module,exports){
/**
 * Created by Administrator on 2017/12/6.
 */
var doubleByteRe = /[^\x00-\xff]/;      //匹配双字节正则



module.exports = {
    isValid: function (fn) {
        return isFunction(fn) ? fn(this) : fn == this.toString();
    },
    charCount: function (char, index) {
        if (!arguments.length) {
            return this.split('').reduce(function (first, second) {        //计算每个字符的出现次数
                first[second]++ || (first[second] = 1);
                return first;
            }, {});
        } else {
            var count = 0;
            var str = this.substr(0, index);
            while (str.indexOf(char) > -1) {
                str = str.replace(char, '');
                count++;
            }
            return count;
        }
    },
    toJSON: function (sep, eq) {
        sep = sep || '&';
        eq = eq || '=';
        var obj = {};
        if (this.length) {
            var ary = this.split(sep);
            ary.forEach(function (item) {
                if (item) {
                    var ary = item.split(eq);
                    obj[ary[0].trim()] = ary[1].trim();
                }
            });
        }
        return obj;
    },
    trim:function(){
        return this.toString().replace(/^\s+|\s+$/,'');
    },
    addSpace:function(n) {
        n = n || 0;
        return new Array(n + 1).join('\t') + this.replace(/[\[\]\{\},]/g, function (match) {
                var suf = '';
                var pre = '';
                if (match == ']' || match == '}') {
                    n--;
                    pre = '\n' + new Array(n + 1).join('\t');
                } else {
                    if(match == '[' || match == '{'){
                        n++;
                    }
                    suf = '\n' + new Array(n + 1).join('\t');
                }
                return pre + match + suf;
            });
    },
    escapeHtml:function(){
        return this.replace(/[<>&\s"']/g,function(match){
            return '&#' +match.charCodeAt(0) + ';';
        });
    },
    unescapeHtml:function(){
        return this.replace(/&#[^;]+;/g,(match) => {
            let codeStr = match.substr(2);
            let code;
            if(codeStr[0] == 'x'){
                code = parseInt(codeStr.substr(1,codeStr.length - 2),16);
            }else{
                code = parseInt(codeStr);
            }
            return String.fromCharCode(code);
        });
    },
    /**
     * 截取最大字节数的字符串，根据剩余字符添加省略号
     * @param lineBytes     每行的字节数，用于指定换行符对应多少字符
     * @param max   最大字节数
     * @param bol   是否添加省略号
     * @returns {string}
     */
    limitBytes:function(lineBytes,max,bol,n){
        n = n == null ? '<br/>' : n;
        var count = 0;
        var str = this.toString();
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
                str = str.substr(0,i) + (bol === false ? '' : '...');
                break;
            }
        }
        return str.replace(/\s?\n\s?/g,n);
    },
    /**
     * 统计字节数
     * @returns {number}
     */
    countBytes:function(){
        var count = 0;
        var len = this.length;
        for(var i = 0;i < len;i++){
            var char = this.charAt(i);
            if(doubleByteRe.test(char)){
                count += 2;
            }else{
                count++;
            }
        }
        return count;
    },
    /**
     * 获取行数以及单行最大字节数
     * @param max
     * @returns {{x: number, y: number}}
     */
    getLensAndLines:function(max) {
        var lineChar = '\n';
        var len = this.length;
        var lineBytes = 0;
        var tempBytes = 0;
        var lines = 1;
        for (var i = 0; i < len; i++) {
            var char = this.charAt(i);
            if (char == lineChar) {
                lines++;
                tempBytes = 0;
                if (tempBytes > lineBytes) {
                    lineBytes = tempBytes
                }
            } else {
                var bytes = doubleByteRe.test(char) ? 2 : 1;
                tempBytes += bytes;
                if (max && tempBytes > max) {
                    lines++;
                    tempBytes = bytes;
                    lineBytes = max;
                }
            }
        }
        return {
            x: Math.max(lineBytes, tempBytes),
            y: lines
        };
    },
    /**
     * 获取所有连续的 子字符串数组
     * @param len
     * @param list
     * @param filter
     * @returns {*}
     */
    getKeywords:function(len,list,filter){
        len = len || 0;
        list = list || [];
        var existFunc = filter ? function(item){
            var suc = filter[item];
            if(!suc){
                filter[item] = 1;
            }
            return suc;
        } : function(item){
            return list.indexOf(item) != -1;
        };
        var strLen = this.length;
        var tempStr = '';
        if(len >= strLen){
            return list;
        }else{
            for(var i = 0,maxI = strLen - len;i < maxI;i++){
                tempStr = '';
                for(var j = 0;j <= len;j++){
                    tempStr += this.charAt(j + i);
                }
                if(!existFunc[tempStr]){
                    list.push(tempStr);
                }
            }
            return this.getKeywords(len + 1,list,filter);
        }
    },
    toNum:function(n){
        var num = parseInt(this);
        return isNaN(num) ? n || 0 : num;
    },
    addZero:function(n){
        var len = this.length;
        var str = this.toString();
        for(var i = len;i < n;i++){
            str = '0' + str;
        }
        return str;
    },
    toHexString:function(){
        return this.split('').map(function(item){
            return getHex(item);
        }).join(' ');
    }
};


function getHex(char){
    var code = +char.charCodeAt(0);
    var utf8Binary = getUtf8Binary(code.toString(2));
    return utf8Binary.split(' ').map(function(binary){
        return parseInt(binary,2).toString(16);
    }).join(' ');
}

function getUtf8Binary(binary){
    var len = binary.length;
    var reBinary;
    if(len < 8){
        reBinary = '0' + binary.addZero(7);
    }else if(len < 12){
        binary = binary.addZero(11);
        reBinary = '110' + binary.substr(0,5) + ' 10' + binary.substr(5);
    }else if(len < 17){
        binary = binary.addZero(16);
        reBinary = '1110' + binary.substr(0,4) + ' 10' + binary.substr(4,6) + ' 10' + binary.substr(10);
    }else if(len < 22){
        binary = binary.addZero(21);
        reBinary = '11110' + binary.substr(0,3) + ' 10' + binary.substr(3,6) + ' 10' + binary.substr(9,6) + ' 10' + binary.substr(15);
    }else if(len < 27){
        binary = binary.addZero(26);
        reBinary = '111110' + binary.substr(0,2) + ' 10' + binary.substr(2,6) + ' 10' + binary.substr(8,6) + ' 10' + binary.substr(14,6) + ' 10' + binary.substr(20);
    }else{
        binary = binary.addZero(31);
        reBinary = '1111110' + binary.substr(0,1) + ' 10' + binary.substr(1,6) + ' 10' + binary.substr(7,6) + ' 10' + binary.substr(13,6) + ' 10' + binary.substr(19,6) + ' 10' + binary.substr(25);
    }
    return reBinary;
}
},{}],6:[function(require,module,exports){
(function (global){
/**
 * Created by Administrator on 2017/2/21.
 */

addObjectMethods();

/**
 * 加载全局对象方法
 */
function addObjectMethods(){
    var win;
    try{
        win = window;
    }catch(e){
        win = global;
    }
    var moduleName,gmodule,oldTarget,prop;
    var modules = {
        Array:require('../object/Array'),
        Date:require('../object/Date'),
        String:require('../object/String')
    };
    for(moduleName in modules){
        gmodule = modules[moduleName];
        oldTarget = win[moduleName];
        if(oldTarget){
            for(prop in gmodule){
                if(gmodule[prop] != undefined && oldTarget.prototype[prop] == undefined){
                    try{
                        Object.defineProperty(oldTarget.prototype,prop,{
                            value:gmodule[prop],
                            enumerable:false
                        });
                    }catch(e){
                        oldTarget.prototype[prop] = gmodule[prop];
                    }
                }
            }
        }
    }
}

var pinyin;
// pinyin = require('./pinyin/pinyin');

//判断对象类型
function isArray(v){
    return Object.prototype.toString.call(v) == '[object Array]';
}
function isObject(v){
    return Object.prototype.toString.call(v) == '[object Object]';
}
function isNumber(v){
    return Object.prototype.toString.call(v) == '[object Number]';
}
function isBoolean(v){
    return Object.prototype.toString.call(v) == '[object Boolean]';
}
function isString(v){
    return Object.prototype.toString.call(v) == '[object String]';
}
function isNull(v){
    return Object.prototype.toString.call(v) == '[object Null]';
}
function isUndefined(v){
    return v == undefined;
}
function isFunction(v){
    return Object.prototype.toString.call(v) == '[object Function]';
}
function isLikeArray(obj){
    var len = isObject(obj) && obj.length;
    return isArray(obj) || len === 0 ||
        typeof len === "number" && len > 0 && ( len - 1 ) in obj;
}

function isPlainObj(obj) {
    return obj && (obj.constructor === Object || obj.constructor === undefined);
}

/**
 * 判断是否为空对象
 * @param obj
 * @returns {boolean}
 */
function isEmpty(obj){
    for (var name in obj) {
        if(obj.hasOwnProperty(name)){
            return false;
        }
    }
    return true;
}


/**
 * 继承属性
 * param 第一个参数如果是bol值，则判断是否深度继承
 * @returns {*|{}}
 */
function extend() {
    var deep = false;
    var target = arguments[0];
    var length = arguments.length;
    var i = 1;
    var options,name,src,copy,copyIsArray,clone,temp;
    if(isBoolean(target)){
        deep = target;
        target = arguments[i++] || {};
    }
    if(typeof target != 'object' && !isFunction(target)){
        target = {};
    }
    for(;i < length;i++){
        options = arguments[i];
        if(options){
            for(name in options){
                if(options.hasOwnProperty(name)){
                    src = target[name];
                    copy = options[name];
                    if ( target === copy ) {
                        continue;
                    }
                    var isObj = isObject(copy);
                    var isLikeAry = isLikeArray(copy);
                    if(deep && (isObj || isLikeAry)){
                        if(isObj){
                            clone = isObject(src) ? src : {};
                        }else{
                            clone = isLikeArray(src) ? src : [];
                        }
                        copy = extend(true,clone,copy);
                    }
                    if(copy != null){
                        target[name] = copy;
                    }
                }
            }
        }
    }
    return target;
}

/**
 * 克隆
 * @param obj   初始对象
 * @param bol   是否深度克隆，默认为深度克隆
 */
function clone(obj,bol = true){
    let target = isArray(obj) ? [] : {};
    for(let name in obj){
        let value = obj[name];
        if(bol && (isObject(value) || isArray(value))){
            value = clone(value,true);
        }
        target[name] = value;
    }
    return target;
}


/**
 * 比较对象值是否相等（不需要同一对象）
 * @param first
 * @param second
 * @returns {boolean}
 */
function equal(first,second){
    if(first == second){
        return true;
    }
    if(!first || !second || first.nodeType == 1 || first.nodeType == 9 || second.nodeType == 1 || second.nodeType == 9 || !isObject(first) && !isArray(first) || !isObject(second) && !isArray(second)){
        return isFunction(first) && isFunction(second) ?  first.toString() == second.toString() : first == second;
    }
    var temp = [];
    for(var name in first){
        if(!equal(first[name],second[name])){
            return false;
        }
        temp.push(name);
    }
    for(name in second){
        if(temp.indexOf(name) == -1){
            if(!equal(first[name],second[name])){
                return false;
            }
        }
    }
    return true;
}


/**
 * 队列执行，根据数组按顺序执行
 * @param opt       配置项有：       list execFunc limit check success
 * @constructor
 */
function Queue(opt){
    this.init(opt);
}
Queue.prototype = {
    init:function(options){
        var default_options = {
            list:[],
            limit:1,
            interval:10,
            runCount:0,
            getItem:function(){
                var list = this.list;
                return list && list.shift();
            },
            check:function(item){
                return !isUndefined(item);
            },
            next:function(){}
        };
        extend(this,default_options,options);
    },
    start:function(){
        for(var i = this.runCount;i < this.limit;i++){
            this.runCount++;
            this._exec();
        }
    },
    _exec:function(){
        if(this.used){
            this.next();
        }else{
            this.used = true;
        }
        var item = this.getItem();
        if(this.check(item)){
            this.execFunc(item,this._continueExec());
        }else{
            this.runCount--;
            if(this.runCount == 0){
                execFunc(this.success);
            }
        }
    },
    _continueExec:function(){
        var _this = this;
        return function(){
            setTimeout(function(){
                _this._exec();
            },_this.interval);
        };
    },
    add:function(list){
        if(!isArray(list)){
            list = [list];
        }
        list.forEach(function(item){
            this.list.push(item);
        },this);
    }
};





/**
 * 异步处理方法
 * @param fn    有两个参数，一个成功回调，一个失败回调
 * @constructor
 */
function Promise(fn){
    this.state = 'pending';
    this.resolveList = [];
    this.rejectList = [];
    this.value = null;
    fn(this.getFunc('resolve'),this.getFunc('reject'));
}

/**
 * 等所有promise异步执行后调用回调
 * @returns {Promise}
 */
Promise.all = function(){
    var ary = [];
    for(var i = 0,len = arguments.length;i < len;i++){
        ary.push(arguments[i]);
    }
    return new Promise(function(cb){
        var result = [];
        var getFunc = function(promise,index){
            return function(value){
                result[index] = value;
                --len == 0 && cb(result);
            }
        };
        ary.forEach(function(item,index){
            item.then(getFunc(item,index),getFunc(item,index));
        });
    })
};
Promise.prototype = {
    then:function(resolve,reject){
        var handler = {
            resolve:resolve,
            reject:reject
        };
        var state = this.state;
        if(!this.isPending()){
            handler[state](this.value);
        }else{
            this.resolveList.push(resolve);
            this.rejectList.push(reject);
        }
        return this;
    },
    getState:function(){
        return this.state;
    },
    isPending:function(){
        return this.state == 'pending';
    },
    getFunc:function(type){
        var promise = this;
        return function(value){
            promise.value = value;
            promise.state = type;
            promise.emit(type,value);
        }
    },
    emit:function(type,value){
        var list = this[type + 'List'];
        var func;
        while(func = list.shift()){
            if(typeof func == 'function'){
                func(value);
            }
        }
    }
};

/**
 * 执行函数
 * @returns {*}
 */
function execFunc(){
    var fn = arguments[0];
    if(typeof fn == 'function'){
        var ary = [];
        for(var i = 1,len = arguments.length;i < len;i++){
            ary.push(arguments[i]);
        }
        return fn.apply(this,ary);
    }
}
//将类数组对象转化为数组
function toArray(nodeList){
    if(nodeList instanceof Array){
        return nodeList;
    }
    var l = nodeList.length;
    var ary = [];
    for (var i = 0; i < l; i++) {
        ary[i] = nodeList[i];
    }
    return ary;
}

/**
 * 遍历数组（包括类数组对象）或者对象执行回调函数
 * @param ary
 * @param fn
 */
function forEach(ary,fn,_this){
    _this = _this || this;
    if(ary != null){
        if(isArray(ary) || ary.length != null){
            for(var i = 0,len = ary.length;i < len;i++){
                if(fn.call(_this,ary[i],i) === false){
                    return;
                }
            }
        }else{
            for(var name in ary){
                if(fn.call(_this,ary[name]) === false){
                    return;
                }
            }
        }
    }
}




var util = {
    isFunction:isFunction,
    isArray:isArray,
    isObject:isObject,
    isNumber:isNumber,
    isString:isString,
    isBoolean:isBoolean,
    isUndefined:isUndefined,
    isEmpty:isEmpty,
    isPlainObj:isPlainObj,
    equal:equal,
    Queue:Queue,
    execFunc:execFunc,
    toArray: toArray,
    Promise:Promise,
    extend: extend,
    pinyin:pinyin,
    forEach:forEach,
    clone
};

module.exports = util;



}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../object/Array":3,"../object/Date":4,"../object/String":5}]},{},[2])