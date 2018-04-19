/**
 * Created by Administrator on 2018/1/12.
 */

let util = require('../util/util');

function $(selector){
    if(util.isFunction(selector)){
        DOMReady(selector);
    }else{
        return new DomElement(selector);
    }
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
    let elemList = [];
    if(selector){
        if(selector.nodeType === 9 || selector.nodeType === 1){
            elemList = [selector];
        }else if (typeof selector === 'string'){
            selector = selector.trim();
            if(selector.charAt(0) === '<'){
                elemList = createElemByHTML(selector);
            }else{
                elemList = document.querySelectorAll(selector);
            }
        }else{
            elemList = selector;
        }
    }
    let len = elemList.length;
    for(let i = 0;i < len;i++){
        this[i] = elemList[i];
    }
    this.length = len;
}
const rnoInnerhtml = /<(?:script|style|link)/i;
// 修改原型
DomElement.prototype = {
    forEach(fn,_this){ //遍历
        _this = _this || this;
        arrForEach(this,fn,_this);
        return this;
    },
    clone(deep){   //克隆
        let cloneList = [];
        this.forEach(elem => {
            cloneList.push(elem.cloneNode(!!deep));
        });
        return $(cloneList);
    },
    add(elem){
        $(elem).forEach(elem => {
            this[this.length++] = elem;
        });
        return this;
    },
    // 获取第几个元素
    eq(index){
        let length = this.length;
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
    first(){
        return this.eq(0);
    },
    // 最后一个
    last(){
        return this.eq(this.length - 1);
    },
    // 绑定事件
    on(type,fn,bol){
        // selector 不为空，证明绑定事件要加代理
        let types = type.split(/\s+/);
        return this.forEach(elem => {
            types.forEach(type => {
                let eventList = elem.eventList;
                if (!eventList) {
                    elem.eventList = eventList = {};
                }
                let funcList = eventList[type];
                if(!funcList){
                    eventList[type] = funcList = [];
                }
                if(elem.addEventListener){
                    funcList.push(fn);
                    elem.addEventListener(type, fn, bol);
                }else{
                    let func = e => {
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
    off(type,fn){
        return this.forEach(elem => {
            let eventList = elem.eventList;
            let funcList = eventList && eventList[type];
            if(funcList){
                if(fn){
                    if (elem.removeEventListener) {
                        elem.removeEventListener(type,fn);
                        funcList.remove(fn);
                    } else {
                        arrForEach(funcList,(targetfn,i) => {
                            if (targetfn.execFunc === fn) {
                                elem.detachEvent('on' + filterEventTypeForIE8(type), targetfn);
                                funcList.splice(i, 1);
                                return false;
                            }
                        });
                    }
                }else{
                    funcList.forEach(fn => this.off(type,fn), this);
                }
            }
        },this);
    },
    // 获取/设置 属性
    attr(key, val) {
        if (val === undefined) {
            return this[0] ? this[0].getAttribute(key) : '';
        } else {
            return this.forEach(function (elem) {
                elem.setAttribute(key, val);
            });
        }
    },
    removeAttr(key){
        return this.forEach(elem => elem.removeAttribute(key));
    },
    prop(key, val) {
        if (val === undefined) {
            return this[0] ? this[0][key] : '';
        } else {
            return this.forEach(elem => {
                elem[key] = val;
            });
        }
    },
    hasClass(className){
        let bol = false;
        arrForEach(this,elem => {
            if(hasClass(elem,className)){
                bol = true;
                return false;
            }
        });
        return bol;
    },
    // 添加 class
    addClass(className) {
        if (!className) {
            return this;
        }
        return this.forEach(elem => {
            className.split(/\s+/).forEach(className => {
                if(!hasClass(elem,className)){
                    elem.className += ' ' + className;
                }
            });
        });
    },
    // 删除 class
    removeClass(className) {
        if (!className) {
            return this;
        }
        return this.forEach(elem => {
            className.split(/\s+/).forEach(className => {
                let re = new RegExp('\\s+' + className + '\\s+');
                elem.className = (' ' + elem.className + ' ').replace(re, ' ').trim();
            });
        });
    },
    toggleClass(className){
        return this.forEach(elem => {
            let $elem = $(elem);
            if($elem.hasClass(className)){
                $elem.removeClass(className);
            }else{
                $elem.addClass(className);
            }
        });
    },
    // 修改 css
    css(key, val) {
        if(util.isString(key)){
            if(val === undefined){
                let elem = this[0];
                return elem ? elem.currentStyle ? elem.currentStyle[key] : getComputedStyle(elem, false)[key] : '';
            }else{
                this.forEach(elem => {
                    elem.style[key] = val;
                });
            }
        }else{
            for (let attr in key) {
                if(key.hasOwnProperty(attr)){
                    this.css(attr, key[attr]);
                }
            }
        }
        return this;
    },
    getElemList(fn){
        let eleList = [];
        this.forEach((elem,i) => {
            let list = fn(elem,i);
            if(list){
                if(!util.isNumber(list.length)){
                    list = [list];
                }
                let tElem;
                for(let n = 0,len = list.length;n < len;n++){
                    tElem = list[n];
                    if(eleList.indexOf(tElem) === -1){
                        eleList.push(tElem);
                    }
                }
            }
        });
        return eleList;
    },
    next(selector){
        let eleList = this.getElemList(elem => {
            let next = elem.nextSibling;
            while(next && (next.nodeType !== 1 || !checkElem(next,selector))){
                next = next.nextSibling;
            }
            return next;
        });
        return $(eleList);
    },
    prev(){
        let eleList = this.getElemList(elem => {
            let prev = elem.previousSibling;
            while(prev && (prev.nodeType !== 1 || !checkElem(prev,selector))){
                prev = prev.previousSibling;
            }
            return prev;
        });
        return $(eleList);
    },
    index(){
        let index = 0;
        let prev = this[0];
        if(prev === undefined){
            return -1;
        }
        while (prev = prev.previousSibling) {
            if(prev.nodeType === 1){
                index++;
            }
        }
        return index;
    },
    // 显示
    show() {
        return this.css('display', 'block');
    },
    // 隐藏
    hide() {
        return this.css('display', 'none');
    },
    parent() {
        let elemList = this.getElemList(elem => elem.parentNode);
        return $(elemList);
    },
    // 获取子节点
    children(selector){
        let elemList = this.getElemList(elem => elem.children);
        return $(elemList).filter(selector);
    },
    // 获取子节点（包括文本节点）
    childNodes() {
        let elemList = this.getElemList(elem => elem.childNodes);
        return $(elemList);
    },
    siblings(selector) {
        let elemList = this.getElemList(elem => {
            let temp = [];
            arrForEach(elem.parentNode.children,sibElem => {
                if (temp.indexOf(sibElem) === -1 && sibElem !== elem && sibElem.nodeType === 1 && checkElem(sibElem,selector)) {
                    temp.push(sibElem);
                }
            });
            return temp;
        });
        return $(elemList);
    },
    // 增加子节点
    append(children) {
        return this.forEach(elem => {
            let $children = $(children);
            $children.forEach(child => elem.appendChild(child));
            $._execScript($children);
        });
    },
    prepend(children){
        return this.forEach(elem => {
            let $children = $(children);
            $children.forEach(child => {
                let firstChild = elem.children[0];
                if(firstChild){
                    elem.insertBefore(child,firstChild);
                }else{
                    elem.appendChild(child);
                }
            });
            $._execScript($children);
        });
    },
    before(children){
        return this.forEach(elem => {
            let $children = $(children);
            $children.forEach(child => {
                elem.parentNode.insertBefore(child,elem);
            });
            $._execScript($children);
        });
    },
    after(children){
        return this.forEach(elem => {
            let $elem = $(elem);
            let $next = $elem.next();
            if($next.length){
                $next.before(children);
            }else{
                $elem.parent().append(children);
            }
        });
    },
    // 移除当前节点
    remove() {
        return this.forEach(elem => {
            elem.parentNode.removeChild(elem);
        });
    },
    // 是否包含某个子节点
    isContain($child){
        let elem = this[0];
        let child = $child[0];
        return elem && child ? elem.contains(child) : false;
    },
    // 尺寸数据
    getRect(){
        let elem = this[0];
        if(elem){
            let {left,top,right,bottom,width,height} = elem.getBoundingClientRect();
            return {
                left,
                top,
                right,
                bottom,
                width:width || right - left,
                height:height || bottom - top
            };
        }
    },
    // 封装 nodeName
    getNodeName() {
        return this[0] ? this[0].nodeName : '';
    },
    // 从当前元素查找
    find(selector){
        let elemList = this.getElemList(elem => elem.querySelectorAll(selector));
        return $(elemList);
    },
    bind(){
        return this.on.apply(this,arguments);
    },
    unbind(){
        return this.off.apply(this,arguments);
    },
    // 获取当前元素的 text
    text(val){
        if(val === undefined) {
            return this[0] ? this[0].innerText : '';
        }else {
            // 设置 text
            return this.forEach(elem => {
                elem.innerText = val;
            });
        }
    },

    // 获取 html
    html(value){
        if(value === undefined) {
            return this[0] ? this[0].innerHTML : '';
        }else if(util.isString(value) && value.charAt(0) !== '<' || util.isNumber(value) || util.isBoolean(value)){
            return this.forEach(elem => {
                elem.innerHTML = value;
            });
        }else{
            return this.empty().append(value);
        }
    },
    // 获取 value
    val(value){
        if(value === undefined){
            return this[0] ? this[0].value : '';
        }else{
            return this.forEach(elem => {
                elem.value = value;
            });
        }
    },
    empty(){
        return this.forEach(elem => {
            elem.innerHTML = '';
        });
    },
    filter(selector){
        let elemList = this.getElemList(elem => checkElem(elem,selector) ? elem : null);
        return $(elemList);
    },
    offset(){
        let elem = this[0];
        if(elem){
            return {
                left:elem.offsetLeft,
                top:elem.offsetTop
            }
        }
    },
    closest(selector){
        let elemList = this.getElemList(elem => {
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
    data(name,value){
        if(value === undefined){
            let elem = this[0];
            return elem ? cacheData.getData(elem,name) : '';
        }else{
            return this.forEach(elem => {
                cacheData.setData(elem,name,value);
            });
        }
    },
    removeData(name){
        return this.forEach(elem => {
            cacheData.removeData(elem,name);
        });
    },
    animate(option = {},time = 100,cb){
        return this.forEach(elem => {
            let $elem = $(elem);
            clearInterval($elem.data('animateTimer'));
            let speedConfig = {};
            let count = Math.ceil(time / 30);
            for(let name in option){
                if(option.hasOwnProperty(name) && option[name] !== undefined){
                    let target = option[name].toString().toFloatNum();
                    speedConfig[name] = (target - $elem.css(name).toFloatNum()) / count;
                    option[name] = target + (name === 'opacity' ? '' : 'px');
                }
            }
            let timer = setInterval(() => {
                let cssObj = option;
                count--;
                if(count === 0){
                    clearInterval(timer);
                    util.execFunc(cb,$elem);
                }else{
                    cssObj = {};
                    for(let name in option){
                        if(option.hasOwnProperty(name) && option[name] !== undefined){
                            cssObj[name] = $elem.css(name).toFloatNum() + speedConfig[name] + (name === 'opacity' ? '' : 'px');
                        }
                    }
                }
                if(cssObj.opacity !== undefined){
                    cssObj.filter = `alpha(opacity=${cssObj.opacity * 100})`;
                }
                $elem.css(cssObj);
            },30);
            $elem.data('animateTimer',timer);
        });
    },
    dragSort(){
        this.off('mousedown').mousedown(function(e){
            let $this = $(this);
            let $target = $(e.target);
            let $item = $target.closest('.dragsort-elem');
            let $items = $item.siblings();
            if(e.which !== 1 || $item.length === 0 || $items.length === 0 || $target.closest('.nodrag-elem').length){
                return;
            }
            let ox = e.clientX;
            let oy = e.clientY;
            let dx,dy,rect;
            let rects = [];
            let isDrag = false;
            function mousemove(e){
                let cx = e.clientX;
                let cy = e.clientY;
                if(!isDrag && (cy !== oy || cx !== ox)){
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
                        let rect = elem.getBoundingClientRect();
                        let width = rect.width || rect.right - rect.left;
                        let $elem = $(elem);
                        let th = $elem.css('marginBottom').toNum();
                        let y = rect.top - th / 2;
                        let x = rect.left + width / 2;
                        let index = rects.indexOfFunc(item => item[0].y === y);
                        let data = {
                            y:y,
                            x:x,
                            i:i
                        };
                        if(index === -1){
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
                    let ary = rects[0];
                    let i;
                    for(i = 0;i < rects.length;i++){
                        if(rects[i][0].y < cy){
                            ary = rects[i];
                        }
                    }
                    let r;
                    let targetIndex = ary[0].i;
                    let isLineHead = true;
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
                    let $target = $items.filter('.drag-active');
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
     */
    drag:function() {
        return this.off('mousedown').mousedown(function(e){
            let $this = $(this);
            let dx = e.clientX - this.offsetLeft + $this.css('marginLeft').toNum();
            let dy = e.clientY - this.offsetTop + $this.css('marginTop').toNum();
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
     */
    zoom:function(){
        return this.off('wheel').wheel(function(e){
            let $this = $(this);
            let rect = $this.getRect();
            let dx = e.clientX - this.offsetLeft;
            let dy = e.clientY - this.offsetTop;
            let oLeft = this.offsetLeft - $this.css('marginLeft').toNum();
            let oTop = this.offsetTop - $this.css('marginTop').toNum();
            let scale = (e.wheelDelta === undefined ? e.deltaY < 0 : e.wheelDelta > 0) ? 1.2 : 1 / 1.2;
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
    magnify(opt){
        let defaultOpt = {
            offset:10,
            scale:8
        };
        this.data('option',util.extend(defaultOpt,opt));
        return this.off('mouseenter').mouseenter(function(e){
            let $this = $(this);
            let rect = $this.getRect();
            let width = rect.width;
            let height = rect.height;
            let opt = $this.data('option');
            let src = $this.find('img').attr('src');
            if(!src || opt.enable && opt.enable.call(this,src)){
                return;
            }
            let $slider = $this.find('.magnify-slider');
            if($slider.length === 0){
                $slider = $('<div class="magnify-slider"></div>');
                $this.append($slider);
            }
            let $viewBox = $('.magnify-view');
            let $body = $('body');
            if($viewBox.length === 0){
                $viewBox = $('<div class="magnify-view"><img class="magnify-img"></div>');
                $body.append($viewBox);
            }
            let $viewImg = $viewBox.find('img').attr('src',src);
            let render = function(e){
                let l = e.clientX - rect.left - sliderWidth / 2;
                let t = e.clientY - rect.top - sliderWidth / 2;
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
            let sliderWidth = $slider.css('width').toNum();
            let scale = opt.scale;
            let offset = opt.offset;
            let boxLeft = rect.right + 10;
            let boxWidth = sliderWidth * scale;
            if(rect.right + boxWidth + offset > innerWidth){
                boxLeft = rect.left - offset - boxWidth;
            }
            let boxTop = rect.top;
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
            const mouseleave = () => {
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
        }).data('fileDropOption',option).on('dragover',e => e.preventDefault());
    }
};



util.extend($,{
    ajax(option){
        let {type = 'get',url,data,async = true,headers = {
            'content-type':'application/x-www-form-urlencoded; charset=UTF-8'
        },processData = true,contentType = true,responseType,success,error,timeout,ontimeout} = option;
        let xhr = new XMLHttpRequest();
        let {execFunc} = util;
        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4){
                let data = xhr.responseText;
                try{
                    data = JSON.parse(data);
                }catch(e){}
                if(xhr.status === 200){
                    execFunc(success,data);
                }else{
                    execFunc(error,data);
                }
            }
        };
        xhr.onerror = e => {
            execFunc(error, xhr.responseText);
        };
        if(processData && util.isPlainObj(data)){
            let temp = [];
            for(let key in data){
                if(data.hasOwnProperty(key)){
                    let value = data[key];
                    if(value !== undefined){
                        value = util.isPlainObj(value) ? JSON.stringify(value) : value;
                        temp.push(key + '=' + value);
                    }
                }
            }
            data = temp.join('&');
            if(type.toUpperCase() === 'GET' && data){
                url += (url.indexOf('?') === -1 ? '?' : '&') + data;
            }
        }
        xhr.open(type,url,async);
        for (let name in headers) {
            if(headers.hasOwnProperty(name)){
                if(name !== 'content-type' || contentType){
                    xhr.setRequestHeader(name, headers[name]);
                }
            }
        }
        wt.extend(xhr,{
            timeout,
            ontimeout,
            responseType
        });
        xhr.send(data);
    },
    _execScript($node){
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
    preventDefault(e){
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
    stopPropagation(e){
        if(e.stopPropagation){
            e.stopPropagation();
        }else{
            e.cancelBubble = true;
        }
    }
});

const eventNames = 'click dblclick mouseover mouseout mouseenter mouseleave mousedown mousemove mouseup keydown keyup wheel change';

eventNames.split(' ').forEach(eventName => {
    DomElement.prototype[eventName] = function(fn){
        return util.isFunction(fn) ? this.on(eventName,fn) : this.forEach(elem => elem.click());
    };
});


function createElemByHTML(selector){
    let div = document.createElement('div');
    div.innerHTML = selector;
    let children = div.children;
    let result = [];
    for(let i = 0,len = children.length;i < len;i++){
        result.push(children[i]);
    }
    return result;
}

/**
 * ie8的事件名称过滤
 * @param type
 * @returns {*}
 */
function filterEventTypeForIE8(type){
    let config = {
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
    let re = new RegExp('\\s+' + className + '\\s+');
    let classStr = ' ' + elem.className + ' ';
    return re.test(classStr);
}

/**
 * 类数组遍历
 * @param ary
 * @param fn
 *  * @param _this
 */
function arrForEach(ary,fn,_this){
    _this = _this || this;
    for(let i = 0,len = ary.length;i < len;i++){
        if(fn.call(_this,ary[i],i) === false){
            break;
        }
    }
}
/**
 * 合并
 */
function concat(first,second){
    let ol = first.length;
    for(let i = 0,len = second.length;i < len;i++){
        first[ol + i] = second[i];
    }
    first.length = ol + len;
}

const selectorExpr = /^(#([\w-]+)|(\w+)|\.([\w-]+))$/;
const selectorPropExpr = /\[[\w\W]+\]$/;
/**
 * 判断元素是否符合选择器
 * @param elem
 * @param selector
 * @returns {boolean}
 */
function checkElem(elem,selector = ''){
    let bol = true;
    selector = selector.replace(selectorPropExpr,(match) => {
        let temp = match.replace(/^\[|\]$/g,'').split('=');
        bol = elem.getAttribute(temp[0]) === temp[1];
        return '';
    });
    let match = selectorExpr.exec(selector);
    return bol ? selector ? match ? match[2] ? elem.id === match[2] : match[3] ? elem.nodeName === match[3].toUpperCase() : match[4] ? hasClass(elem,match[4]) : false : false : true : false;
}

/**
 * 数据存储中心
 * @type {{data: Array, getDataByElem: cacheData.getDataByElem, setData: cacheData.setData, getData: cacheData.getData, removeData: cacheData.removeData}}
 */
let cacheData = {
    data:[],
    getDataByElem(elem){
        let index = this.data.indexOfFunc(data => data._target === elem);
        return this.data[index];
    },
    setData(elem,name,value){
        let data = this.getDataByElem(elem);
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
    getData(elem,name){
        let data = this.getDataByElem(elem);
        return data ? data.data[name] : '';
    },
    removeData(elem,name){
        let data = this.getDataByElem(elem);
        if(data){
            if(name === undefined){
                this.data.remove(data);
            }else{
                delete data.data[name];
            }
        }
    }
};

function DOMReady(fn){
    if(document.readyState === 'complete'){
        fn();
    }else if(document.addEventListener){
        document.addEventListener('DOMContentLoaded',fn,false);
    }else{
        ieDOMReady(fn);
    }
}

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