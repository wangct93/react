(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Created by Administrator on 2018/1/12.
 */

var util = require('../util/util');

function $(selector) {
    if (util.isFunction(selector)) {
        DOMReady(selector);
    } else {
        return new DomElement(selector);
    }
}

module.exports = $;

// 创建构造函数
function DomElement(selector) {
    // selector 本来就是 DomElement 对象，直接返回
    if (selector instanceof DomElement) {
        return selector;
    }
    this.selector = selector;
    // 根据 selector 得出的结果（如 DOM，DOM List）
    var elemList = [];
    if (selector) {
        if (selector.nodeType === 9 || selector.nodeType === 1) {
            elemList = [selector];
        } else if (typeof selector === 'string') {
            selector = selector.trim();
            if (selector.charAt(0) === '<') {
                elemList = createElemByHTML(selector);
            } else {
                elemList = document.querySelectorAll(selector);
            }
        } else {
            elemList = selector;
        }
    }
    var len = elemList.length;
    for (var i = 0; i < len; i++) {
        this[i] = elemList[i];
    }
    this.length = len;
}
var rnoInnerhtml = /<(?:script|style|link)/i;
// 修改原型
DomElement.prototype = {
    forEach: function forEach(fn, _this) {
        //遍历
        _this = _this || this;
        arrForEach(this, fn, _this);
        return this;
    },
    clone: function clone(deep) {
        //克隆
        var cloneList = [];
        this.forEach(function (elem) {
            cloneList.push(elem.cloneNode(!!deep));
        });
        return $(cloneList);
    },
    add: function add(elem) {
        var _this2 = this;

        $(elem).forEach(function (elem) {
            _this2[_this2.length++] = elem;
        });
        return this;
    },

    // 获取第几个元素
    eq: function eq(index) {
        var length = this.length;
        if (length) {
            if (index >= length) {
                index = index % length;
            }
            while (index < 0) {
                index += length;
            }
        }
        return $(this[index]);
    },

    // 第一个
    first: function first() {
        return this.eq(0);
    },

    // 最后一个
    last: function last() {
        return this.eq(this.length - 1);
    },

    // 绑定事件
    on: function on(type, fn, bol) {
        // selector 不为空，证明绑定事件要加代理
        var types = type.split(/\s+/);
        return this.forEach(function (elem) {
            types.forEach(function (type) {
                var eventList = elem.eventList;
                if (!eventList) {
                    elem.eventList = eventList = {};
                }
                var funcList = eventList[type];
                if (!funcList) {
                    eventList[type] = funcList = [];
                }
                if (elem.addEventListener) {
                    funcList.push(fn);
                    elem.addEventListener(type, fn, bol);
                } else {
                    var func = function func(e) {
                        e = e || event;
                        e.target = e.target || e.srcElement;
                        e.deltaY = -e.wheelDelta;
                        fn.call(elem, e);
                    };
                    func.execFunc = fn;
                    funcList.push(func);
                    elem.attachEvent('on' + filterEventTypeForIE8(type), func);
                }
            });
        });
    },

    // 取消事件绑定
    off: function off(type, fn) {
        var _this3 = this;

        return this.forEach(function (elem) {
            var eventList = elem.eventList;
            var funcList = eventList && eventList[type];
            if (funcList) {
                if (fn) {
                    if (elem.removeEventListener) {
                        elem.removeEventListener(type, fn);
                        funcList.remove(fn);
                    } else {
                        arrForEach(funcList, function (targetfn, i) {
                            if (targetfn.execFunc === fn) {
                                elem.detachEvent('on' + filterEventTypeForIE8(type), targetfn);
                                funcList.splice(i, 1);
                                return false;
                            }
                        });
                    }
                } else {
                    funcList.forEach(function (fn) {
                        return _this3.off(type, fn);
                    }, _this3);
                }
            }
        }, this);
    },

    // 获取/设置 属性
    attr: function attr(key, val) {
        if (val === undefined) {
            return this[0] ? this[0].getAttribute(key) : '';
        } else {
            return this.forEach(function (elem) {
                elem.setAttribute(key, val);
            });
        }
    },
    removeAttr: function removeAttr(key) {
        return this.forEach(function (elem) {
            return elem.removeAttribute(key);
        });
    },
    prop: function prop(key, val) {
        if (val === undefined) {
            return this[0] ? this[0][key] : '';
        } else {
            return this.forEach(function (elem) {
                elem[key] = val;
            });
        }
    },
    hasClass: function hasClass(className) {
        var bol = false;
        arrForEach(this, function (elem) {
            if (_hasClass(elem, className)) {
                bol = true;
                return false;
            }
        });
        return bol;
    },

    // 添加 class
    addClass: function addClass(className) {
        if (!className) {
            return this;
        }
        return this.forEach(function (elem) {
            className.split(/\s+/).forEach(function (className) {
                if (!_hasClass(elem, className)) {
                    elem.className += ' ' + className;
                }
            });
        });
    },

    // 删除 class
    removeClass: function removeClass(className) {
        if (!className) {
            return this;
        }
        return this.forEach(function (elem) {
            className.split(/\s+/).forEach(function (className) {
                var re = new RegExp('\\s+' + className + '\\s+');
                elem.className = (' ' + elem.className + ' ').replace(re, ' ').trim();
            });
        });
    },
    toggleClass: function toggleClass(className) {
        return this.forEach(function (elem) {
            var $elem = $(elem);
            if ($elem.hasClass(className)) {
                $elem.removeClass(className);
            } else {
                $elem.addClass(className);
            }
        });
    },

    // 修改 css
    css: function css(key, val) {
        if (util.isString(key)) {
            if (val === undefined) {
                var elem = this[0];
                return elem ? elem.currentStyle ? elem.currentStyle[key] : getComputedStyle(elem, false)[key] : '';
            } else {
                this.forEach(function (elem) {
                    elem.style[key] = val;
                });
            }
        } else {
            for (var attr in key) {
                if (key.hasOwnProperty(attr)) {
                    this.css(attr, key[attr]);
                }
            }
        }
        return this;
    },
    getElemList: function getElemList(fn) {
        var eleList = [];
        this.forEach(function (elem, i) {
            var list = fn(elem, i);
            if (list) {
                if (!util.isNumber(list.length)) {
                    list = [list];
                }
                var tElem = void 0;
                for (var n = 0, _len = list.length; n < _len; n++) {
                    tElem = list[n];
                    if (eleList.indexOf(tElem) === -1) {
                        eleList.push(tElem);
                    }
                }
            }
        });
        return eleList;
    },
    next: function next(selector) {
        var eleList = this.getElemList(function (elem) {
            var next = elem.nextSibling;
            while (next && (next.nodeType !== 1 || !checkElem(next, selector))) {
                next = next.nextSibling;
            }
            return next;
        });
        return $(eleList);
    },
    prev: function prev() {
        var eleList = this.getElemList(function (elem) {
            var prev = elem.previousSibling;
            while (prev && (prev.nodeType !== 1 || !checkElem(prev, selector))) {
                prev = prev.previousSibling;
            }
            return prev;
        });
        return $(eleList);
    },
    index: function index() {
        var index = 0;
        var prev = this[0];
        if (prev === undefined) {
            return -1;
        }
        while (prev = prev.previousSibling) {
            if (prev.nodeType === 1) {
                index++;
            }
        }
        return index;
    },

    // 显示
    show: function show() {
        return this.css('display', 'block');
    },

    // 隐藏
    hide: function hide() {
        return this.css('display', 'none');
    },
    parent: function parent() {
        var elemList = this.getElemList(function (elem) {
            return elem.parentNode;
        });
        return $(elemList);
    },

    // 获取子节点
    children: function children(selector) {
        var elemList = this.getElemList(function (elem) {
            return elem.children;
        });
        return $(elemList).filter(selector);
    },

    // 获取子节点（包括文本节点）
    childNodes: function childNodes() {
        var elemList = this.getElemList(function (elem) {
            return elem.childNodes;
        });
        return $(elemList);
    },
    siblings: function siblings(selector) {
        var elemList = this.getElemList(function (elem) {
            var temp = [];
            arrForEach(elem.parentNode.children, function (sibElem) {
                if (temp.indexOf(sibElem) === -1 && sibElem !== elem && sibElem.nodeType === 1 && checkElem(sibElem, selector)) {
                    temp.push(sibElem);
                }
            });
            return temp;
        });
        return $(elemList);
    },

    // 增加子节点
    append: function append(children) {
        return this.forEach(function (elem) {
            var $children = $(children);
            $children.forEach(function (child) {
                return elem.appendChild(child);
            });
            $._execScript($children);
        });
    },
    prepend: function prepend(children) {
        return this.forEach(function (elem) {
            var $children = $(children);
            $children.forEach(function (child) {
                var firstChild = elem.children[0];
                if (firstChild) {
                    elem.insertBefore(child, firstChild);
                } else {
                    elem.appendChild(child);
                }
            });
            $._execScript($children);
        });
    },
    before: function before(children) {
        return this.forEach(function (elem) {
            var $children = $(children);
            $children.forEach(function (child) {
                elem.parentNode.insertBefore(child, elem);
            });
            $._execScript($children);
        });
    },
    after: function after(children) {
        return this.forEach(function (elem) {
            var $elem = $(elem);
            var $next = $elem.next();
            if ($next.length) {
                $next.before(children);
            } else {
                $elem.parent().append(children);
            }
        });
    },

    // 移除当前节点
    remove: function remove() {
        return this.forEach(function (elem) {
            elem.parentNode.removeChild(elem);
        });
    },

    // 是否包含某个子节点
    isContain: function isContain($child) {
        var elem = this[0];
        var child = $child[0];
        return elem && child ? elem.contains(child) : false;
    },

    // 尺寸数据
    getRect: function getRect() {
        var elem = this[0];
        if (elem) {
            var _elem$getBoundingClie = elem.getBoundingClientRect(),
                left = _elem$getBoundingClie.left,
                top = _elem$getBoundingClie.top,
                right = _elem$getBoundingClie.right,
                bottom = _elem$getBoundingClie.bottom,
                width = _elem$getBoundingClie.width,
                height = _elem$getBoundingClie.height;

            return {
                left: left,
                top: top,
                right: right,
                bottom: bottom,
                width: width || right - left,
                height: height || bottom - top
            };
        }
    },

    // 封装 nodeName
    getNodeName: function getNodeName() {
        return this[0] ? this[0].nodeName : '';
    },

    // 从当前元素查找
    find: function find(selector) {
        var elemList = this.getElemList(function (elem) {
            return elem.querySelectorAll(selector);
        });
        return $(elemList);
    },
    bind: function bind() {
        return this.on.apply(this, arguments);
    },
    unbind: function unbind() {
        return this.off.apply(this, arguments);
    },

    // 获取当前元素的 text
    text: function text(val) {
        if (val === undefined) {
            return this[0] ? this[0].innerText : '';
        } else {
            // 设置 text
            return this.forEach(function (elem) {
                elem.innerText = val;
            });
        }
    },


    // 获取 html
    html: function html(value) {
        if (value === undefined) {
            return this[0] ? this[0].innerHTML : '';
        } else if (util.isString(value) && value.charAt(0) !== '<' || util.isNumber(value) || util.isBoolean(value)) {
            return this.forEach(function (elem) {
                elem.innerHTML = value;
            });
        } else {
            return this.empty().append(value);
        }
    },

    // 获取 value
    val: function val(value) {
        if (value === undefined) {
            return this[0] ? this[0].value : '';
        } else {
            return this.forEach(function (elem) {
                elem.value = value;
            });
        }
    },
    empty: function empty() {
        return this.forEach(function (elem) {
            elem.innerHTML = '';
        });
    },
    filter: function filter(selector) {
        var elemList = this.getElemList(function (elem) {
            return checkElem(elem, selector) ? elem : null;
        });
        return $(elemList);
    },
    offset: function offset() {
        var elem = this[0];
        if (elem) {
            return {
                left: elem.offsetLeft,
                top: elem.offsetTop
            };
        }
    },
    closest: function closest(selector) {
        var elemList = this.getElemList(function (elem) {
            while (elem) {
                if (checkElem(elem, selector)) {
                    break;
                }
                elem = elem.parentNode;
            }
            return elem;
        });
        return $(elemList);
    },
    data: function data(name, value) {
        if (value === undefined) {
            var elem = this[0];
            return elem ? cacheData.getData(elem, name) : '';
        } else {
            return this.forEach(function (elem) {
                cacheData.setData(elem, name, value);
            });
        }
    },
    removeData: function removeData(name) {
        return this.forEach(function (elem) {
            cacheData.removeData(elem, name);
        });
    },
    animate: function animate() {
        var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
        var cb = arguments[2];

        return this.forEach(function (elem) {
            var $elem = $(elem);
            clearInterval($elem.data('animateTimer'));
            var speedConfig = {};
            var count = Math.ceil(time / 30);
            for (var name in option) {
                if (option.hasOwnProperty(name) && option[name] !== undefined) {
                    var target = option[name].toString().toFloatNum();
                    speedConfig[name] = (target - $elem.css(name).toFloatNum()) / count;
                    option[name] = target + (name === 'opacity' ? '' : 'px');
                }
            }
            var timer = setInterval(function () {
                var cssObj = option;
                count--;
                if (count === 0) {
                    clearInterval(timer);
                    util.execFunc(cb, $elem);
                } else {
                    cssObj = {};
                    for (var _name in option) {
                        if (option.hasOwnProperty(_name) && option[_name] !== undefined) {
                            cssObj[_name] = $elem.css(_name).toFloatNum() + speedConfig[_name] + (_name === 'opacity' ? '' : 'px');
                        }
                    }
                }
                if (cssObj.opacity !== undefined) {
                    cssObj.filter = 'alpha(opacity=' + cssObj.opacity * 100 + ')';
                }
                $elem.css(cssObj);
            }, 30);
            $elem.data('animateTimer', timer);
        });
    },
    dragSort: function dragSort() {
        this.off('mousedown').mousedown(function (e) {
            var $this = $(this);
            var $target = $(e.target);
            var $item = $target.closest('.dragsort-elem');
            var $items = $item.siblings();
            if (e.which !== 1 || $item.length === 0 || $items.length === 0 || $target.closest('.nodrag-elem').length) {
                return;
            }
            var ox = e.clientX;
            var oy = e.clientY;
            var dx = void 0,
                dy = void 0,
                rect = void 0;
            var rects = [];
            var isDrag = false;
            function mousemove(e) {
                var cx = e.clientX;
                var cy = e.clientY;
                if (!isDrag && (cy !== oy || cx !== ox)) {
                    isDrag = true;
                    rect = $item[0].getBoundingClientRect();
                    dx = ox - rect.left;
                    dy = oy - rect.top;
                    $item.css({
                        position: 'absolute',
                        zIndex: 500,
                        left: rect.left + 'px',
                        top: rect.top + 'px'
                    });
                    $items.forEach(function (elem, i) {
                        var rect = elem.getBoundingClientRect();
                        var width = rect.width || rect.right - rect.left;
                        var $elem = $(elem);
                        var th = $elem.css('marginBottom').toNum();
                        var y = rect.top - th / 2;
                        var x = rect.left + width / 2;
                        var index = rects.indexOfFunc(function (item) {
                            return item[0].y === y;
                        });
                        var data = {
                            y: y,
                            x: x,
                            i: i
                        };
                        if (index === -1) {
                            rects.push([data]);
                        } else {
                            rects[index].push(data);
                        }
                    });
                    $('body').append($item);
                    mousemove(e);
                } else if (isDrag) {
                    $item.css({
                        left: cx - dx + 'px',
                        top: cy - dy + 'px'
                    });
                    var ary = rects[0];
                    var i = void 0;
                    for (i = 0; i < rects.length; i++) {
                        if (rects[i][0].y < cy) {
                            ary = rects[i];
                        }
                    }
                    var r = void 0;
                    var targetIndex = ary[0].i;
                    var isLineHead = true;
                    for (i = 0; i < ary.length; i++) {
                        r = ary[i];
                        if (r.x < cx) {
                            isLineHead = false;
                            targetIndex = r.i;
                        }
                    }
                    $items.removeClass('drag-active');
                    $items.removeClass('drag-active-left');
                    if (isLineHead) {
                        $items.eq(targetIndex).addClass('drag-active-left');
                    } else {
                        $items.eq(targetIndex).addClass('drag-active');
                    }
                }
            }
            function mouseup(e) {
                if (isDrag) {
                    var _$target = $items.filter('.drag-active');
                    $item.css({
                        left: 0,
                        top: 0,
                        position: 'relative',
                        zIndex: 'auto'
                    });
                    if (_$target.length) {
                        _$target.after($item).removeClass('drag-active');
                    } else {
                        _$target = $items.filter('.drag-active-left');
                        if (_$target.length) {
                            _$target.before($item).removeClass('drag-active-left');
                        } else {
                            $items.parent().append($item);
                        }
                    }
                }
                $('body').off('mousemove', mousemove).off('mouseup', mouseup);
            }
            $('body').mousemove(mousemove).mouseup(mouseup);
        });
        this[0].onselectstart = function () {
            return false;
        };
        $('body')[0].ondragstart = function () {
            return false;
        };
    },

    /**
     * 拖拽触发方法
     */
    drag: function drag() {
        return this.off('mousedown').mousedown(function (e) {
            var $this = $(this);
            var dx = e.clientX - this.offsetLeft + $this.css('marginLeft').toNum();
            var dy = e.clientY - this.offsetTop + $this.css('marginTop').toNum();
            function mousemove(e) {
                $this.css({
                    left: e.clientX - dx + 'px',
                    top: e.clientY - dy + 'px'
                });
            }
            function mouseup(e) {
                $('body').off('mousemove', mousemove).off('mouseup', mouseup);
            }
            $('body').mousemove(mousemove).mouseup(mouseup);
        });
    },
    /**
     * 缩放方法
     */
    zoom: function zoom() {
        return this.off('wheel').wheel(function (e) {
            var $this = $(this);
            var rect = $this.getRect();
            var dx = e.clientX - this.offsetLeft;
            var dy = e.clientY - this.offsetTop;
            var oLeft = this.offsetLeft - $this.css('marginLeft').toNum();
            var oTop = this.offsetTop - $this.css('marginTop').toNum();
            var scale = (e.wheelDelta === undefined ? e.deltaY < 0 : e.wheelDelta > 0) ? 1.2 : 1 / 1.2;
            $this.css({
                width: rect.width * scale + 'px',
                height: rect.height * scale + 'px',
                left: oLeft + dx * (1 - scale) + 'px',
                top: oTop + dy * (1 - scale) + 'px'
            });
            $.preventDefault(e);
        });
    },
    /**
     * 放大镜效果
     */
    magnify: function magnify(opt) {
        var defaultOpt = {
            offset: 10,
            scale: 8
        };
        this.data('option', util.extend(defaultOpt, opt));
        return this.off('mouseenter').mouseenter(function (e) {
            var $this = $(this);
            var rect = $this.getRect();
            var width = rect.width;
            var height = rect.height;
            var opt = $this.data('option');
            var src = $this.find('img').attr('src');
            if (!src || opt.enable && opt.enable.call(this, src)) {
                return;
            }
            var $slider = $this.find('.magnify-slider');
            if ($slider.length === 0) {
                $slider = $('<div class="magnify-slider"></div>');
                $this.append($slider);
            }
            var $viewBox = $('.magnify-view');
            var $body = $('body');
            if ($viewBox.length === 0) {
                $viewBox = $('<div class="magnify-view"><img class="magnify-img"></div>');
                $body.append($viewBox);
            }
            var $viewImg = $viewBox.find('img').attr('src', src);
            var render = function render(e) {
                var l = e.clientX - rect.left - sliderWidth / 2;
                var t = e.clientY - rect.top - sliderWidth / 2;
                l = Math.min(Math.max(l, 0), width - sliderWidth);
                t = Math.min(Math.max(t, 0), height - sliderWidth);
                $slider.css({
                    left: l + 'px',
                    top: t + 'px'
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
            if (rect.right + boxWidth + offset > innerWidth) {
                boxLeft = rect.left - offset - boxWidth;
            }
            var boxTop = rect.top;
            if (boxTop + boxWidth > innerHeight) {
                boxTop = rect.bottom - boxWidth;
            }
            $viewBox.css({
                left: boxLeft + 'px',
                top: boxTop + 'px',
                width: boxWidth + 'px',
                height: boxWidth + 'px'
            });
            $viewImg.css({
                width: width * scale + 'px',
                height: height * scale + 'px'
            });
            render(e);
            $slider.show();
            $viewBox.show();
            var mouseleave = function mouseleave() {
                $slider.hide();
                $viewBox.hide();
                $('body').off('mousemove', render);
                $this.off('mouseleave', mouseleave);
            };
            $body.on('mousemove', render);
            $this.on('mouseleave', mouseleave);
        });
    },
    paste: function paste(option) {
        this.off('paste').on('paste', function (e) {
            var clipboardData = e.clipboardData,
                target = e.target;

            var item = clipboardData.items[0];

            var _ref = $(target).data('pasteOption') || {},
                success = _ref.success;

            if (item && item.type.indexOf('image') !== -1) {
                var reader = new FileReader();
                var file = item.getAsFile();
                reader.onload = function (e) {
                    wt.execFunc.call(target, success, e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                wt.execFunc.call(target, success, clipboardData.getData('text'));
            }
        }).data('pasteOption', option);
    },
    fileDrop: function fileDrop(option) {
        this.off('drop').on('drop', function (e) {
            e.preventDefault();
            var dataTransfer = e.dataTransfer,
                target = e.target;
            var files = dataTransfer.files;

            var _ref2 = $(target).data('fileDropOption') || {},
                _success = _ref2.success;

            var q = new wt.Queue({
                list: Array.from(files),
                execFunc: function execFunc(file, cb) {
                    var _this4 = this;

                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var result = _this4.result;

                        if (!result) {
                            result = [];
                            _this4.result = result;
                        }
                        result.push(e.target.result);
                        cb();
                    };
                    reader.readAsDataURL(file);
                },
                success: function success() {
                    wt.execFunc.call(target, _success, this.result);
                }
            });
            q.start();
        }).data('fileDropOption', option).on('dragover', function (e) {
            return e.preventDefault();
        });
    }
};

util.extend($, {
    ajax: function ajax(option) {
        var _option$type = option.type,
            type = _option$type === undefined ? 'get' : _option$type,
            url = option.url,
            data = option.data,
            _option$async = option.async,
            async = _option$async === undefined ? true : _option$async,
            _option$headers = option.headers,
            headers = _option$headers === undefined ? {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        } : _option$headers,
            _option$processData = option.processData,
            processData = _option$processData === undefined ? true : _option$processData,
            _option$contentType = option.contentType,
            contentType = _option$contentType === undefined ? true : _option$contentType,
            responseType = option.responseType,
            success = option.success,
            error = option.error,
            timeout = option.timeout,
            ontimeout = option.ontimeout;

        var xhr = new XMLHttpRequest();
        var execFunc = util.execFunc;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var _data = xhr.responseText;
                try {
                    _data = JSON.parse(_data);
                } catch (e) {}
                if (xhr.status === 200) {
                    execFunc(success, _data);
                } else {
                    execFunc(error, _data);
                }
            }
        };
        xhr.onerror = function (e) {
            execFunc(error, xhr.responseText);
        };
        if (processData && util.isPlainObj(data)) {
            var temp = [];
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var value = data[key];
                    if (value !== undefined) {
                        value = util.isPlainObj(value) ? JSON.stringify(value) : value;
                        temp.push(key + '=' + value);
                    }
                }
            }
            data = temp.join('&');
            if (type.toUpperCase() === 'GET' && data) {
                url += (url.indexOf('?') === -1 ? '?' : '&') + data;
            }
        }
        xhr.open(type, url, async);
        for (var name in headers) {
            if (headers.hasOwnProperty(name)) {
                if (name !== 'content-type' || contentType) {
                    xhr.setRequestHeader(name, headers[name]);
                }
            }
        }
        wt.extend(xhr, {
            timeout: timeout,
            ontimeout: ontimeout,
            responseType: responseType
        });
        xhr.send(data);
    },
    _execScript: function _execScript($node) {
        $node = $node instanceof DomElement ? $node : $($node);
        $node.find('script').forEach(function (script) {
            if (script.src) {
                $.ajax({
                    url: script.src,
                    async: false,
                    success: function success(data) {
                        try {
                            eval(data);
                        } catch (e) {}
                    }
                });
            } else {
                try {
                    eval(script.innerHTML);
                } catch (e) {}
            }
        });
    },

    /**
     * 取消默认行为
     * @param e
     */
    preventDefault: function preventDefault(e) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    },

    /**
     * 取消冒泡
     * @param e
     */
    stopPropagation: function stopPropagation(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    }
});

var eventNames = 'click dblclick mouseover mouseout mouseenter mouseleave mousedown mousemove mouseup keydown keyup wheel change';

eventNames.split(' ').forEach(function (eventName) {
    DomElement.prototype[eventName] = function (fn) {
        return util.isFunction(fn) ? this.on(eventName, fn) : this.forEach(function (elem) {
            return elem.click();
        });
    };
});

function createElemByHTML(selector) {
    var div = document.createElement('div');
    div.innerHTML = selector;
    var children = div.children;
    var result = [];
    for (var i = 0, _len2 = children.length; i < _len2; i++) {
        result.push(children[i]);
    }
    return result;
}

/**
 * ie8的事件名称过滤
 * @param type
 * @returns {*}
 */
function filterEventTypeForIE8(type) {
    var config = {
        'wheel': 'mousewheel'
    };
    return config[type] || type;
}

/**
 * 判断是否含有class
 * @param className
 * @param elem
 * @returns {boolean}
 */
function _hasClass(elem, className) {
    var re = new RegExp('\\s+' + className + '\\s+');
    var classStr = ' ' + elem.className + ' ';
    return re.test(classStr);
}

/**
 * 类数组遍历
 * @param ary
 * @param fn
 *  * @param _this
 */
function arrForEach(ary, fn, _this) {
    _this = _this || this;
    for (var i = 0, _len3 = ary.length; i < _len3; i++) {
        if (fn.call(_this, ary[i], i) === false) {
            break;
        }
    }
}
/**
 * 合并
 */
function concat(first, second) {
    var ol = first.length;
    for (var i = 0, _len4 = second.length; i < _len4; i++) {
        first[ol + i] = second[i];
    }
    first.length = ol + len;
}

var selectorExpr = /^(#([\w-]+)|(\w+)|\.([\w-]+))$/;
var selectorPropExpr = /\[[\w\W]+\]$/;
/**
 * 判断元素是否符合选择器
 * @param elem
 * @param selector
 * @returns {boolean}
 */
function checkElem(elem) {
    var selector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    var bol = true;
    selector = selector.replace(selectorPropExpr, function (match) {
        var temp = match.replace(/^\[|\]$/g, '').split('=');
        bol = elem.getAttribute(temp[0]) === temp[1];
        return '';
    });
    var match = selectorExpr.exec(selector);
    return bol ? selector ? match ? match[2] ? elem.id === match[2] : match[3] ? elem.nodeName === match[3].toUpperCase() : match[4] ? _hasClass(elem, match[4]) : false : false : true : false;
}

/**
 * 数据存储中心
 * @type {{data: Array, getDataByElem: cacheData.getDataByElem, setData: cacheData.setData, getData: cacheData.getData, removeData: cacheData.removeData}}
 */
var cacheData = {
    data: [],
    getDataByElem: function getDataByElem(elem) {
        var index = this.data.indexOfFunc(function (data) {
            return data._target === elem;
        });
        return this.data[index];
    },
    setData: function setData(elem, name, value) {
        var data = this.getDataByElem(elem);
        if (data) {
            data.data[name] = value;
        } else {
            data = {
                _target: elem,
                data: {}
            };
            data.data[name] = value;
            this.data.push(data);
        }
    },
    getData: function getData(elem, name) {
        var data = this.getDataByElem(elem);
        return data ? data.data[name] : '';
    },
    removeData: function removeData(elem, name) {
        var data = this.getDataByElem(elem);
        if (data) {
            if (name === undefined) {
                this.data.remove(data);
            } else {
                delete data.data[name];
            }
        }
    }
};

function DOMReady(fn) {
    if (document.readyState === 'complete') {
        fn();
    } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fn, false);
    } else {
        ieDOMReady(fn);
    }
}

/**
 * ie判断DOM元素加载完成事件
 * @param fn
 */
function ieDOMReady(fn) {
    try {
        document.documentElement.doScroll('left');
        fn();
    } catch (e) {
        setTimeout(function () {
            ieDOMReady(fn);
        }, 10);
    }
}
},{"../util/util":6}],2:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Administrator on 2017/12/6.
 */
var util = require('../util/util');
var $ = require('../$/$');

window.wt = util;
window.$ = window.$ || $;

/*初始化窗口宽高*/
try {
    window.innerHeight = window.innerHeight || document.documentElement.offsetHeight;
    window.innerWidth = window.innerWidth || document.documentElement.offsetWidth;
} catch (e) {}

/**
 * ie判断DOM元素加载完成事件
 * @param fn
 */
function ieDOMReady(fn) {
    try {
        document.documentElement.doScroll('left');
        fn();
    } catch (e) {
        setTimeout(function () {
            ieDOMReady(fn);
        }, 10);
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
function isFirefox() {
    return navigator.userAgent.indexOf('Firefox') !== -1;
}
/**
 * 判断是否为火狐浏览器
 * @returns {boolean}
 */
function isChrome() {
    return navigator.userAgent.indexOf('Chrome') !== -1;
}
/**
 * 判断是否为Opera浏览器
 * @returns {boolean}
 */
function isOpera() {
    return navigator.userAgent.indexOf('Opera') !== -1;
}
/**
 * 判断是否为Safari浏览器
 * @returns {boolean}
 */
function isSafari() {
    return navigator.userAgent.indexOf('Safari') !== -1;
}

/**
 * 画框方法mousedown
 * @param e
 */
function drawRectMousedown(e) {
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
        right: posRight / width * 100 + '%',
        bottom: posBottom / height * 100 + '%',
        width: 0,
        height: 0
    });

    var mousemove = function mousemove(e) {
        var posLeft = 'auto';
        var posTop = 'auto';
        var cx = e.clientX - rect.left;
        var cy = e.clientY - rect.top;
        var dx = cx - ox;
        var dy = cy - oy;
        if (dx > 0) {
            posLeft = ox / width * 100 + '%';
            dx = Math.min(dx, width - ox);
        } else {
            dx = Math.min(-dx, ox);
        }
        if (dy > 0) {
            posTop = oy / height * 100 + '%';
            dy = Math.min(dy, height - oy);
        } else {
            dy = Math.min(-dy, oy);
        }
        $div.css({
            left: posLeft,
            top: posTop,
            width: dx / width * 100 + '%',
            height: dy / height * 100 + '%'
        });
    };

    var opt = this.drawRectOpt;
    var mouseup = function mouseup(e) {
        var cx = Math.max(Math.min(e.clientX - rect.left, width), 0);
        var cy = Math.max(Math.min(e.clientY - rect.top, height), 0);
        var pleft = Math.min(ox, cx) / width;
        var ptop = Math.min(oy, cy) / height;
        var pwidth = Math.abs(ox - cx) / width;
        var pheight = Math.abs(oy - cy) / height;
        $div.css({
            left: pleft * 100 + '%',
            top: ptop * 100 + '%',
            width: pwidth * 100 + '%',
            height: pheight * 100 + '%'
        });
        $div.attr('coord', pleft + ',' + ptop + ',' + (pleft + pwidth) + ',' + (ptop + pheight));
        $('body').off('mousemove', mousemove).off('mouseup', mouseup);
        util.execFunc(opt.mouseup, $div);
    };
    $('body').mousemove(mousemove).mouseup(mouseup);
}

/**
 * 表单ajax提交
 * @param option
 */
function ajaxSubmit(option) {
    var default_options = {
        url: '/',
        method: 'post',
        enctype: 'multipart/form-data'
    };
    var opt = util.extend({}, default_options, option);
    if (window.FormData) {
        ajaxSubmitForFormData(opt);
    } else {
        ajaxSubmitForIE8(opt);
    }
}

/**
 * 谷歌表单提交
 * @param opt
 */
function ajaxSubmitForFormData(opt) {
    var data = new FormData();
    var form = opt.form;
    $(form).find('input').forEach(function (input) {
        var $input = $(input);
        var name = $input.attr('name');
        if (name) {
            if ($input.attr('type') === 'file') {
                util.forEach(input.files, function (file, i) {
                    data.append(name + '_' + i, file);
                });
            } else {
                data.append(name, input.value);
            }
        }
    });
    util.ajax({
        url: opt.url,
        type: opt.method,
        data: data,
        processData: false,
        contentType: false,
        success: opt.success,
        error: opt.error
    });
}

/**
 * IE8表单提交，只适合本地后台
 * @param opt
 */
function ajaxSubmitForIE8(opt) {
    var _this2 = this;

    var form = opt.form;
    var $form = $(form);
    if (opt.enctype) {
        $form.attr('enctype', opt.enctype);
    }
    if (opt.method) {
        $form.attr('method', opt.method);
    }
    if (opt.url) {
        $form.attr('action', opt.url);
    }
    var $cloneForm = $form.clone(true);
    var $iframe = $('<iframe style="display: none"></iframe>');

    var load = function load() {
        $iframe.off('load', load);
        var doc = getDoc(_this2);
        $iframe.after($form);
        doc.body.appendChild(form);
        try {
            form.submit();
        } catch (err) {
            // just in case form has element with name/id of 'submit'
            var submitFn = document.createElement('form').submit;
            submitFn.apply(form);
        }
        var _this = _this2;
        var startTime = +new Date();
        var timeout = opt.timeout || 6000;
        var timer = setInterval(function () {
            if (+new Date() - startTime > timeout) {
                clearInterval(timer);
                console.log('the ajaxSubmit is timeout!');
                util.execFunc(opt.error);
                $iframe.remove();
            } else {
                var _doc = getDoc(_this);
                if (_doc && _doc.body.innerText) {
                    util.execFunc(opt.success, _doc.body.innerText);
                    clearInterval(timer);
                    $iframe.remove();
                }
            }
        }, 500);
    };
    $iframe.on('load', load);
    $iframe.attr('src', /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank');
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
    } catch (err) {
        // IE8 access denied under ssl & missing protocol
        console.log('cannot get iframe.contentWindow document: ' + err);
    }

    if (doc) {
        // successful getting content
        return doc;
    }

    try {
        // simply checking may throw in ie8 under ssl or mismatched protocol
        doc = frame.contentDocument ? frame.contentDocument : frame.document;
    } catch (err) {
        // last attempt
        console.log('cannot get iframe.contentDocument: ' + err);
        doc = frame.document;
    }
    return doc;
}

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

var LoadImgList = function () {
    function LoadImgList(option) {
        _classCallCheck(this, LoadImgList);

        this.init(option);
    }

    LoadImgList.prototype.init = function init(option) {
        var _option$limit = option.limit,
            limit = _option$limit === undefined ? 3 : _option$limit,
            _option$list = option.list,
            list = _option$list === undefined ? [] : _option$list,
            _option$interval = option.interval,
            interval = _option$interval === undefined ? 30 : _option$interval,
            imgLoad = option.imgLoad,
            imgError = option.imgError,
            errorSrc = option.errorSrc;

        list = util.isArray(list) ? list : util.toArray(list);
        this.queue = new util.Queue({
            list: list,
            execFunc: function execFunc(img, cb) {
                var $img = $(img);
                if ($img.prop('src')) {
                    cb();
                } else {
                    var src = $img.attr('dsrc');
                    setTimeout(function () {
                        if (!img.complete) {
                            if (errorSrc) {
                                img.src = errorSrc;
                            } else {
                                img.src = null;
                                cb();
                            }
                        }
                    }, 6000);
                    $img.on('load', function () {
                        util.execFunc(imgLoad, this);
                        cb();
                    }).on('error', function () {
                        util.execFunc(imgError, this);
                    }).attr('src', src);
                }
            },

            interval: interval,
            limit: limit
        });
    };

    LoadImgList.prototype.load = function load() {
        this.queue.start();
    };

    LoadImgList.prototype.add = function add(list) {
        this.queue.addItem(list);
    };

    return LoadImgList;
}();

/**
 * 表单取值赋值方法
 * @param opt
 * @returns {{}}
 */


function formData(opt) {
    var _opt$formatTarget = opt.formatTarget,
        formatTarget = _opt$formatTarget === undefined ? window : _opt$formatTarget,
        _opt$formatField = opt.formatField,
        formatField = _opt$formatField === undefined ? 'format' : _opt$formatField,
        _opt$list = opt.list,
        list = _opt$list === undefined ? [] : _opt$list,
        _opt$field = opt.field,
        field = _opt$field === undefined ? 'vtext' : _opt$field,
        data = opt.data;

    var result = data || {};
    $(list).forEach(function (elem) {
        var $elem = $(elem);
        var field = $elem.attr(field);
        if (field) {
            var nodeName = $elem.getNodeName();
            var eleOpFunc = nodeName === 'INPUT' || nodeName === 'TEXTAREA' ? 'val' : 'html';
            var formatFunc = formatTarget[$elem.attr(formatField)];
            if (typeof formatFunc !== 'function') {
                formatFunc = function formatFunc(item) {
                    return item;
                };
            }
            if (data) {
                $elem[eleOpFunc](formatFunc(data[field]));
            } else {
                result[field] = $elem[eleOpFunc]();
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
function Paging(options) {
    var target = options.target;
    if (target && target.nodeType === 1) {
        this.setOpt(options);
        this.init();
    } else {
        throw new Error('参数中的target不是一个dom元素！');
    }
}
Paging.prototype = {
    init: function init(options) {
        this.initHtml();
        this.addEvent();
    },
    setOpt: function setOpt(options) {
        var default_options = {
            pageSize: 10,
            total: 100,
            pageNum: 1,
            itemLength: 10,
            message: '共{maxNum}页',
            hasInput: true
        };
        options.$target = $(options.target);
        util.extend(this, default_options, options);
    },
    initHtml: function initHtml() {
        var $box = this.$target;
        var maxPageNum = this.getMaxNum();
        var len = Math.min(maxPageNum, this.itemLength);
        var message = this.getMessage();
        var html = '<span class="paging-btn paging-btn-prev">上一页</span><div class="paging-pagebox">';
        for (var i = 1; i <= len; i++) {
            html += '<span class="paging-item ' + (i === 1 ? 'active' : '') + '">' + i + '</span>';
        }
        html += '</div><span class="paging-btn paging-btn-next">下一页</span>';
        if (this.hasInput) {
            html += '<input class="paging-input" type="text">';
        }
        html += '<span class="paging-message">' + message + '</span>';
        $box.html(html);
        $box.addClass('paging-box paging-box-' + (this.position || 'right'));
        var $btns = $box.find('.paging-btn');
        this.$prevBtn = $btns.eq(0);
        this.$nextBtn = $btns.eq(1);
        this.$input = $box.find('.paging-input');
    },
    resetTotal: function resetTotal(total) {
        var opt = this.opt;
        if (this.total !== total) {
            this.total = total;
            var max = this.getMaxNum();
            var len = Math.min(max, this.itemLength);
            var html = '';
            var num = this.pageNum;
            for (var i = 1; i <= len; i++) {
                html += '<span class="paging-item ' + (i === num ? 'active' : '') + '">' + i + '</span>';
            }
            this.$prevBtn.next().html(html);
            this.updateBtnState();
            this.$input.next().html(this.getMessage());
        }
    },
    updateBtnState: function updateBtnState() {
        var $prevBtn = this.$prevBtn;
        var $nextBtn = this.$nextBtn;
        var maxPage = this.getMaxNum();
        if (this.pageNum === 1) {
            $prevBtn.addClass('paging-diasbaled');
        } else {
            $prevBtn.removeClass('paging-diasbaled');
        }
        if (this.pageNum >= maxPage) {
            $nextBtn.addClass('paging-diasbaled');
        } else {
            $nextBtn.removeClass('paging-diasbaled');
        }
    },
    getMaxNum: function getMaxNum() {
        return Math.ceil(this.total / this.pageSize) || 1;
    },
    getMessage: function getMessage() {
        var dic = {
            'total': this.total,
            'num': this.pageNum,
            'size': this.size,
            'maxNum': this.getMaxNum()
        };
        return this.message.replace(/\{[\w\W]*\}/g, function (match) {
            var keyword = match.substring(1, match.length - 1);
            return dic[keyword] || '';
        });
    },
    addEvent: function addEvent() {
        var _this = this;
        this.$target.on('click', function (e) {
            var $target = $(e.target);
            if ($target.hasClass('paging-btn') && !$target.hasClass('paging-diasbaled')) {
                var num = $(this).find('.active').html().toNum();
                _this.select(num + ($target.hasClass('paging-btn-next') ? 1 : -1));
            } else if ($target.hasClass('paging-item')) {
                _this.select($target.html().toNum());
            }
        });
        this.$input.on('keydown', function (e) {
            var filterCodes = [8, 37, 39];
            var keyCode = e.keyCode;
            if (filterCodes.indexOf(keyCode) === -1 && !(keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 105)) {
                wt.preventDefault(e);
            }
        }).on('keyup', function (e) {
            var v = this.value.toNum();
            var max = _this.getMaxNum();
            if (v > max) {
                v = max;
                this.value = v;
            }
            if (e.keyCode === 13) {
                _this.select(v);
            }
        });
    },
    select: function select(num) {
        this.pageNum = num;
        var $target = this.$target;
        var len = this.itemLength;
        var maxPageNum = this.getMaxNum();
        var halfLen = Math.floor(len / 2);
        var extNum = num - halfLen;
        if (num <= halfLen + 1) {
            extNum = 1;
        } else if (num > maxPageNum - halfLen) {
            extNum = maxPageNum - len + 1;
        }
        $target.find('.paging-item').forEach(function (item, index) {
            var $item = $(item);
            var n = extNum + index;
            $item.html(n);
            if (n === num) {
                $item.addClass('active');
            } else {
                $item.removeClass('active');
            }
        });
        this.updateBtnState();
        util.execFunc.call(this, this.onSelect, num, this.pageSize);
    },
    reload: function reload() {
        util.execFunc.call(this, this.onSelect, this.pageNum, this.pageSize);
    }
};

function previewImg() {
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
        util.execFunc(opt.onChange, this);
    });
}

function fullScreen(target) {
    target = target || document.body;
    var requestMethod = target.requestFullScreen || //W3C
    target.webkitRequestFullScreen || //Chrome等
    target.mozRequestFullScreen || //FireFox
    target.msRequestFullscreen; //IE11
    if (requestMethod) {
        requestMethod.call(target);
    } else if (typeof window.ActiveXObject !== 'undefined') {
        //for Internet Explorer
        try {
            var wscript = new ActiveXObject('WScript.Shell');
            wscript.SendKeys('{F11}');
        } catch (e) {
            this.alert('请先将本站加入信任站点，并允许ActiveX控件交互，再进行全屏操作！');
        }
    }
}

function exitFullScreen() {
    var exitMethod = document.exitFullscreen || //W3C
    document.mozCancelFullScreen || //FireFox等
    document.webkitExitFullscreen || //Chrome
    document.msExitFullscreen; //IE11等
    if (exitMethod) {
        exitMethod.call(document);
    } else if (typeof window.ActiveXObject !== 'undefined') {
        //for Internet Explorer
        try {
            var wscript = new ActiveXObject('WScript.Shell');
            wscript.SendKeys('{F11}');
        } catch (e) {
            this.alert('请先将本站加入信任站点，并允许ActiveX控件交互，再进行全屏操作！');
        }
    }
}

function getCPU() {
    var agent = navigator.userAgent.toLowerCase();
    if (agent.indexOf("win64") >= 0 || agent.indexOf("wow64") >= 0) {
        return "x64";
    }
    return navigator.cpuClass;
}

var wt = {
    isIE: isIE,
    isChrome: isChrome,
    isFirefox: isFirefox,
    isSafari: isSafari,
    isOpera: isOpera,
    $: $,
    //简单封装ajax
    ajax: $.ajax,
    //添加指定js文件
    addScript: function addScript(src, win) {
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
    getQueryString: function getQueryString(name, win) {
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
    addActive: function addActive(ele, bol) {
        var $ele = $(ele);
        $ele.addClass('active');
        if (bol !== false) {
            $ele.siblings().removeClass('active');
        }
    },
    /**
     * 取消冒泡
     * @param e
     */
    stopPropagation: $.stopPropagation,
    /**
     * 取消默认事件
     * @param e
     */
    preventDefault: $.preventDefault,
    /**
     * 表单取值赋值方法
     * @returns {{}}
     */
    formData: formData,
    /**
     * 表单ajax提交
     */
    ajaxSubmit: ajaxSubmit,
    //本地图片预览
    previewImg: previewImg,
    /**
     * 弹窗方法
     * @param option
     */
    dialog: function dialog(option) {
        var closeFunc = function closeFunc() {
            var $container = $(this).closest('.mask-container');
            if ($container.length) {
                $container.remove();
                util.execFunc(option.onClose);
            }
        };
        var defaultOpt = {
            id: 'w_win_dialog_' + +new Date(),
            title: '默认标题',
            width: 400,
            height: 300,
            modal: true,
            toTop: true,
            tools: [],
            buttons: [{
                iconCls: 'icon-close',
                text: '关闭',
                handler: closeFunc
            }],
            content: '',
            btnAlign: 'right'
        };
        var opt = util.extend(defaultOpt, option);
        opt.tools.push({
            iconCls: 'icon-win-close',
            handler: closeFunc
        });
        var toolHtml = '';
        var btnHtml = '';
        opt.tools.forEach(function (item) {
            toolHtml += '<span class="prompt-tool prompt-handler ' + item.iconCls + '"></span>';
        });
        opt.buttons.forEach(function (item) {
            btnHtml += '<a class="w-btn prompt-handler"><i class="iconfont ' + (item.iconCls ? item.iconCls : 'iconfont-hide') + '"></i><span>' + item.text + '</span></a>';
        });
        var html = '<div class="mask-container"><div class="mask-shadow"></div><div class="prompt-box" style="width:' + opt.width + 'px;height:' + opt.height + 'px;margin:-' + opt.height / 2 + 'px 0 0 -' + opt.width / 2 + 'px"><div class="prompt-header"><span>' + opt.title + '</span><div class="prompt-toolbox">' + toolHtml + '</div></div><div class="prompt-body fit" id="' + opt.id + '">' + opt.content + '</div><div class="prompt-btnbox" style="text-align:' + opt.btnAlign + '">' + btnHtml + '</div></div></div>';
        var $container = $(html);
        $('body').append($container);
        $container.on('click', function (e) {
            var $target = $(e.target);
            var $btn = $target.closest('.prompt-handler');
            if ($btn.length) {
                var btnType = $btn.hasClass('.prompt-tool') ? 'tools' : 'buttons';
                opt[btnType][$btn.index()].handler.call($btn[0]);
            }
        });
        return $container;
    },
    /**
     * 打开全屏模式
     * @param target    全屏的目标元素
     */
    fullScreen: fullScreen,
    /**
     * 退出全屏
     */
    exitFullScreen: exitFullScreen,
    /**
     * 获取系统位数
     * @returns {*}
     */
    getCPU: getCPU,
    /**
     * 弹窗提示信息
     * @param info  内容
     */
    alert: function alert(info) {
        var opt = {
            title: '提示',
            width: 300,
            height: 165,
            btnCenter: true,
            buttons: [{
                iconCls: 'icon-ok',
                text: '确定',
                handler: function handler() {
                    $(this).closest('.mask-container').remove();
                }
            }],
            content: '<div class="prompt-content fit"><div class="prompt-icon"></div><div class="prompt-text">' + info + '</div></div>'
        };
        this.dialog(opt);
    },
    /**
     * 获取页面最外层滚动条高度
     * @returns {*}
     */
    scrollTop: function scrollTop(v) {
        if (v !== undefined) {
            v = v.toString().toNum();
            document.body.scrollTop = v;
            document.documentElement.scrollTop = v;
        } else {
            return document.documentElement.scrollTop || document.body.scrollTop;
        }
    },
    bindDrawRect: function bindDrawRect(opt) {
        var $target = $(opt.target);
        var target = $target[0];
        $target.on('mousedown', drawRectMousedown);
        target.onselectstart = function () {
            return false;
        };
        target.drawRectOpt = opt;
    },
    unbindDrawRect: function unbindDrawRect(opt) {
        var $target = $(opt.target);
        var target = $target[0];
        $target.off('mousedown', drawRectMousedown);
        delete target.drawRectOpt;
    },
    /**
     * 逐个加载图片，需要加图片地址塞到img的dsrc属性上
     * 然后将图片加入列表即可，最后调用render加载图片
     */
    LoadImgList: LoadImgList,
    /**
     * 显示处理中遮罩层，提示用户以及防止重复点击
     * @param msg   提示的信息
     */
    inProcess: function inProcess(msg) {
        msg = msg || '&nbsp;';

        var html = '<div class="mask-container text-center process-box"><div class="mask-shadow"></div>' + '<div class="process-text">' + msg + '</div>' + '<div class="inline-m fit-height"></div></div>';
        var $div = $(html);
        $('body').append($div);
    },
    /**
     * 删除所有处理中遮罩层
     */
    outProcess: function outProcess() {
        $('.process-box').remove();
    },
    /**
     * 分页组件
     */
    Paging: Paging
};
util.extend(util, wt);
},{"../$/$":1,"../util/util":6}],3:[function(require,module,exports){
"use strict";

/**
 * Created by Administrator on 2017/12/6.
 */

module.exports = {
    forEach: function forEach(fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn !== 'function') {
            throw new TypeError(fn + " is not a function");
        }
        var fn_this = arguments.length > 1 ? arguments[1] : this;
        for (var i = 0; i < this.length; i++) {
            fn.call(fn_this, this[i], i, this);
        }
    },
    reduce: function reduce(fn, value) {
        if (!this.length) {
            return value;
        }
        if (value === undefined) {
            value = this[0];
        } else {
            value = fn(value, this[0], 0);
        }
        for (var i = 1; i < this.length; i++) {
            value = fn(value, this[i], i);
        }
        return value;
    },
    every: function every(fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn !== 'function') {
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
    some: function some(fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn !== 'function') {
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
    map: function map(fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn !== 'function') {
            throw new TypeError(fn + " is not a function");
        }
        var fn_this = arguments.length > 1 ? arguments[1] : this;
        var array = [];
        for (var i = 0; i < this.length; i++) {
            array.push(fn.call(fn_this, this[i], i, this));
        }
        return array;
    },
    filter: function filter(fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn !== 'function') {
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
    indexOf: function indexOf(value) {
        if (value !== undefined) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === value) {
                    return i;
                }
            }
        }
        return -1;
    },
    indexOfFunc: function indexOfFunc(fn) {
        for (var i = 0; i < this.length; i++) {
            if (typeof fn === 'function' ? fn(this[i]) : fn === this[i]) {
                return i;
            }
        }
        return -1;
    },
    remove: function remove(item) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === item) {
                this.splice(i, 1);
                break;
            }
        }
        return this;
    },
    toFieldObject: function toFieldObject(field) {
        var target = {};
        this.forEach(function (item, i) {
            var fieldStr = typeof field === 'function' ? field(item, i) : item[field] || i;
            target[fieldStr] = item;
        });
        return target;
    },
    noRepeat: function noRepeat() {
        for (var i = 0; i < this.length; i++) {
            for (var j = i + 1; j < this.length; j++) {
                if (this[i] === this[j]) {
                    this.splice(j, 1);
                    j--;
                }
            }
        }
        return this;
    }
};
},{}],4:[function(require,module,exports){
'use strict';

/**
 * Created by Administrator on 2017/12/6.
 */
module.exports = {
    toFormatString: function toFormatString(str) {
        str = str || 'YYYY-MM-DD hh:mm:ss';
        var config = {
            Y: this.getFullYear(),
            M: this.getMonth() + 1,
            D: this.getDate(),
            h: this.getHours(),
            m: this.getMinutes(),
            s: this.getSeconds()
        };

        var _loop = function _loop(char) {
            str = str.replace(new RegExp(char + '+', 'g'), function (match) {
                return config[char].toString().addZero(match.length);
            });
        };

        for (var char in config) {
            _loop(char);
        }
        return str;
    },
    diffDays: function diffDays(num) {
        return diff(this, 'Date', num);
    },
    diffMonths: function diffMonths(num) {
        return diff(this, 'Month', num);
    },
    diffYears: function diffYears(num) {
        return diff(this, 'FullYear', num);
    },
    diffHours: function diffHours(num) {
        return diff(this, 'Hours', num);
    },
    diffMinutes: function diffMinutes(num) {
        return diff(this, 'Minutes', num);
    },
    diffSeconds: function diffSeconds(num) {
        return diff(this, 'Seconds', num);
    }
};

function diff(date, type, num) {
    type = type || 'Year';
    var temp = ['FullYear', 'Date', 'Month', 'Hours', 'Minutes', 'Seconds'];
    var targetDate = new Date(date);
    if (temp.indexOf(type) !== -1) {
        targetDate['set' + type](targetDate['get' + type]() + num.toString().toNum(0));
    }
    return targetDate;
}
},{}],5:[function(require,module,exports){
'use strict';

/**
 * Created by Administrator on 2017/12/6.
 */
var doubleByteRe = /[^\x00-\xff]/; //匹配双字节正则


module.exports = {
    isValid: function isValid(fn) {
        return typeof fn === 'function' ? fn(this) : fn === this.toString();
    },
    charCount: function charCount(char, index) {
        if (!arguments.length) {
            return this.split('').reduce(function (first, second) {
                //计算每个字符的出现次数
                if (first[second]) {
                    first[second]++;
                } else {
                    first[second] = 1;
                }
                return first;
            }, {});
        } else {
            var count = 0;
            var str = this.substr(0, index);
            for (var i = 0; i < str.length; i++) {
                if (str.charAt(i) === char) {
                    count++;
                }
            }
            return count;
        }
    },
    toJSON: function toJSON() {
        var sep = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '&';
        var eq = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '=';

        var obj = {};
        if (this.length) {
            var ary = this.split(sep);
            ary.forEach(function (item) {
                if (item) {
                    var _ary = item.split(eq);
                    obj[_ary[0].trim()] = _ary[1].trim();
                }
            });
        }
        return obj;
    },
    trim: function trim() {
        return this.toString().replace(/^\s+|\s+$/g, '');
    },
    addSpaceForJsonStr: function addSpaceForJsonStr() {
        var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        return new Array(n + 1).join('\t') + this.replace(/[\[\]\{\},]/g, function (match) {
            var suf = '';
            var pre = '';
            if (match === ']' || match === '}') {
                n--;
                pre = '\n' + new Array(n + 1).join('\t');
            } else {
                if (match === '[' || match === '{') {
                    n++;
                }
                suf = '\n' + new Array(n + 1).join('\t');
            }
            return pre + match + suf;
        });
    },
    escapeHtml: function escapeHtml() {
        return this.replace(/[<>&\s"']/g, function (match) {
            return '&#' + match.charCodeAt(0) + ';';
        });
    },
    unescapeHtml: function unescapeHtml() {
        return this.replace(/&#[^;]+;/g, function (match) {
            var codeStr = match.substr(2);
            var code = void 0;
            if (codeStr[0] === 'x') {
                code = parseInt(codeStr.substr(1, codeStr.length - 2), 16);
            } else {
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
     * @param br   换行符替代元素
     * @returns {string}
     */
    limitBytes: function limitBytes(lineBytes, max, bol) {
        var br = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '<br/>';

        var count = 0;
        var str = this.toString();
        var len = str.length;
        for (var i = 0; i < len; i++) {
            var char = str.charAt(i);
            if (char === '\n') {
                count = (Math.floor(count / lineBytes) + 1) * lineBytes;
            } else if (doubleByteRe.test(char)) {
                count += 2;
            } else {
                count++;
            }
            if (count >= max) {
                str = str.substr(0, i) + (bol === false ? '' : '...');
                break;
            }
        }
        return str.replace(/\s?\n\s?/g, br);
    },

    /**
     * 统计字节数
     * @returns {number}
     */
    countBytes: function countBytes() {
        var count = 0;
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var char = this.charAt(i);
            if (doubleByteRe.test(char)) {
                count += 2;
            } else {
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
    getLensAndLines: function getLensAndLines(max) {
        var lineChar = '\n';
        var len = this.length;
        var lineBytes = 0;
        var tempBytes = 0;
        var lines = 1;
        for (var i = 0; i < len; i++) {
            var char = this.charAt(i);
            if (char === lineChar) {
                lines++;
                tempBytes = 0;
                if (tempBytes > lineBytes) {
                    lineBytes = tempBytes;
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
    getKeywords: function getKeywords(len, list, filter) {
        len = len || 0;
        list = list || [];
        var existFunc = filter ? function (item) {
            var suc = filter[item];
            if (!suc) {
                filter[item] = 1;
            }
            return suc;
        } : function (item) {
            return list.indexOf(item) !== -1;
        };
        var strLen = this.length;
        var tempStr = '';
        if (len >= strLen) {
            return list;
        } else {
            for (var i = 0, maxI = strLen - len; i < maxI; i++) {
                tempStr = '';
                for (var j = 0; j <= len; j++) {
                    tempStr += this.charAt(j + i);
                }
                if (!existFunc[tempStr]) {
                    list.push(tempStr);
                }
            }
            return this.getKeywords(len + 1, list, filter);
        }
    },
    toNum: function toNum() {
        var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        var num = parseInt(this);
        return isNaN(num) ? n : num;
    },
    toFloatNum: function toFloatNum() {
        var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        var num = parseFloat(this);
        return isNaN(num) ? n : num;
    },
    addZero: function addZero(n) {
        var len = this.length;
        var str = this.toString();
        for (var i = len; i < n; i++) {
            str = '0' + str;
        }
        return str;
    },
    toUtf8HexString: function toUtf8HexString() {
        return this.split('').map(function (char) {
            var code = char.charCodeAt(0);
            return encodeUtf8(code.toString(2)).split(' ').map(function (binary) {
                return parseInt(binary, 2).toString(16);
            }).join(' ');
        }).join(' ');
    },
    decodeUtf8ByHex: function decodeUtf8ByHex() {
        return String.fromCharCode(parseInt(decodeUtf8(parseInt(this.replace(/\s/g, ''), 16).toString(2)), 2));
    },
    toCssValue: function toCssValue() {
        var px = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'px';

        var num = parseInt(this);
        return this.indexOf('%') !== -1 || isNaN(num) ? this : num + px;
    }
};

function encodeUtf8(binary) {
    var length = binary.length;
    if (length < 8) {
        return '0' + binary.addZero(7);
    }
    var ary = [];
    var headLen = length % 6;
    ary.push(binary.substr(0, headLen));
    for (var i = headLen; i < length; i += 6) {
        ary.push(binary.substr(i, 6));
    }
    var aryLen = ary.length;
    return '1'.repeat(aryLen) + '0'.repeat(8 - aryLen - headLen) + ary.join(' 10');
}

function decodeUtf8(binary) {
    var length = binary.length;
    var num = Math.ceil(length / 8);
    binary.addZero(num * 8);
    var result = '';
    for (var i = 0; i < binary.length; i += 8) {
        if (i === 0) {
            result += binary.substr(num, 8 - num).replace(/^0+/, '');
        } else {
            result += binary.substr(i + 2, 6);
        }
    }
    return result;
}
},{}],6:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Administrator on 2017/2/21.
 */

addObjectMethods();

/**
 * 加载全局对象方法
 */
function addObjectMethods() {
    var win;
    try {
        win = window;
    } catch (e) {
        win = global;
    }
    var moduleName, gmodule, oldTarget, prop;
    var modules = {
        Array: require('../object/Array'),
        Date: require('../object/Date'),
        String: require('../object/String')
    };
    for (moduleName in modules) {
        gmodule = modules[moduleName];
        oldTarget = win[moduleName];
        if (oldTarget) {
            for (prop in gmodule) {
                if (gmodule[prop] != undefined && oldTarget.prototype[prop] == undefined) {
                    try {
                        Object.defineProperty(oldTarget.prototype, prop, {
                            value: gmodule[prop],
                            enumerable: false
                        });
                    } catch (e) {
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
function isArray(v) {
    return Object.prototype.toString.call(v) == '[object Array]';
}
function isObject(v) {
    return Object.prototype.toString.call(v) == '[object Object]';
}
function isNumber(v) {
    return Object.prototype.toString.call(v) == '[object Number]';
}
function isBoolean(v) {
    return Object.prototype.toString.call(v) == '[object Boolean]';
}
function isString(v) {
    return Object.prototype.toString.call(v) == '[object String]';
}
function isNull(v) {
    return Object.prototype.toString.call(v) == '[object Null]';
}
function isUndefined(v) {
    return v == undefined;
}
function isFunction(v) {
    return Object.prototype.toString.call(v) == '[object Function]';
}
function isLikeArray(obj) {
    var len = isObject(obj) && obj.length;
    return isArray(obj) || len === 0 || typeof len === "number" && len > 0 && len - 1 in obj;
}

function isPlainObj(obj) {
    return obj && (obj.constructor === Object || obj.constructor === undefined);
}

/**
 * 判断是否为空对象
 * @param obj
 * @returns {boolean}
 */
function isEmpty(obj) {
    for (var name in obj) {
        if (obj.hasOwnProperty(name)) {
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
    if (isBoolean(target)) {
        deep = target;
        target = arguments[i++] || {};
    }
    if (isUndefined(target) || isNumber(target) || isString(target) || isBoolean(target)) {
        target = {};
    }
    for (; i < length; i++) {
        var pData = arguments[i];
        if (isPlainObj(pData) || isArray(pData)) {
            for (var name in pData) {
                var selfValue = target[name];
                var pValue = pData[name];
                if (deep && (isPlainObj(pValue) || isArray(pValue))) {
                    var subTarget = void 0;
                    if (isPlainObj(pValue)) {
                        subTarget = isPlainObj(selfValue) ? selfValue : {};
                    } else {
                        subTarget = isArray(selfValue) ? selfValue : [];
                    }
                    pValue = extend(true, subTarget, pValue);
                }
                if (pValue != null) {
                    target[name] = pValue;
                }
            }
        }
    }
    return target;
}

/**
 * 克隆
 * @param obj   初始对象
 * @param bol   是否深度克隆，默认为true
 */
function clone(obj, bol) {
    var target = void 0;
    if (isPlainObj(obj) || isArray(obj)) {
        bol = bol !== false;
        target = isArray(obj) ? [] : {};
        for (var name in obj) {
            var value = obj[name];
            if (bol && (isPlainObj(value) || isArray(value))) {
                value = clone(value, true);
            }
            target[name] = value;
        }
    }
    return target;
}

/**
 * 比较对象值是否相等（必须是同一类型，不需要同一对象）
 * @param first
 * @param second
 * @returns {boolean}
 */
function equal(first, second) {
    if ((typeof first === 'undefined' ? 'undefined' : _typeof(first)) === (typeof second === 'undefined' ? 'undefined' : _typeof(second))) {
        if (isPlainObj(first) || isArray(first)) {
            var fieldData = {};
            for (var name in first) {
                if (!equal(first[name], second[name])) {
                    return false;
                }
                fieldData[name] = 1;
            }
            for (var _name in second) {
                if (!fieldData[_name] && !equal(first[_name], second[_name])) {
                    return false;
                }
            }
            return true;
        } else {
            return first === second;
        }
    }
    return false;
}

/**
 * 队列执行，根据数组按顺序执行
 * @param opt       配置项有：       list execFunc limit check success
 * @constructor
 */

var Queue = function () {
    function Queue(option) {
        _classCallCheck(this, Queue);

        this.init(option);
    }

    Queue.prototype.init = function init(option) {
        var defaultOption = {
            limit: 1,
            interval: 10,
            _runCount: 0,
            list: [],
            result: [],
            getItem: function getItem() {
                var list = this.list;

                return list.shift();
            },
            check: function check(item) {
                return item !== undefined;
            }
        };
        extend(this, defaultOption, option);
    };

    Queue.prototype.start = function start() {
        var _runCount = this._runCount,
            limit = this.limit;

        for (var i = _runCount; i < limit; i++) {
            this._runCount++;
            this._exec();
        }
    };

    Queue.prototype._exec = function _exec() {
        var _this2 = this;

        var item = this.getItem();
        execFunc.call(this, this.next);
        if (item === undefined) {
            this._runCount--;
            if (this._runCount === 0) {
                execFunc.call(this, this.success, this.result);
            }
        } else if (this.check(item)) {
            this.execFunc(item, function (data) {
                _this2.result.push(data);
                setTimeout(function () {
                    _this2._exec();
                }, _this2.interval);
            });
        } else {
            this._exec();
        }
    };

    Queue.prototype.addItem = function addItem(items) {
        var _list;

        if (!isArray(items)) {
            items = [items];
        }
        (_list = this.list).push.apply(_list, items);
    };

    return Queue;
}();

/**
 * 异步处理方法
 * @param fn    有两个参数，一个成功回调，一个失败回调
 * @constructor
 */

// class Promise{
//     constructor(){
//         this.state = 0;
//         this.resolveList = [];
//         this.rejectList = [];
//         this.value = null;
//         fn(this.getFunc('resolve'),this.getFunc('reject'));
//     }
// }


function Promise(fn) {
    this.state = 'pending';
    this.resolveList = [];
    this.rejectList = [];
    this.value = null;
    fn(this.getFunc('resolve'), this.getFunc('reject'));
}

/**
 * 等所有promise异步执行后调用回调
 * @returns {Promise}
 */
Promise.all = function (ary) {
    // var ary = [];
    // for(var i = 0,len = arguments.length;i < len;i++){
    //     ary.push(arguments[i]);
    // }
    var len = ary.length;
    return new Promise(function (cb) {
        var result = [];
        var getFunc = function getFunc(promise, index) {
            return function (value) {
                result[index] = value;
                --len == 0 && cb(result);
            };
        };
        ary.forEach(function (item, index) {
            item.then(getFunc(item, index), getFunc(item, index));
        });
    });
};
Promise.prototype = {
    then: function then(resolve, reject) {
        var handler = {
            resolve: resolve,
            reject: reject
        };
        var state = this.state;
        if (!this.isPending()) {
            handler[state](this.value);
        } else {
            this.resolveList.push(resolve);
            this.rejectList.push(reject);
        }
        return this;
    },
    getState: function getState() {
        return this.state;
    },
    isPending: function isPending() {
        return this.state == 'pending';
    },
    getFunc: function getFunc(type) {
        var promise = this;
        return function (value) {
            promise.value = value;
            promise.state = type;
            promise.emit(type, value);
        };
    },
    emit: function emit(type, value) {
        var list = this[type + 'List'];
        var func;
        while (func = list.shift()) {
            if (typeof func == 'function') {
                func(value);
            }
        }
    }
};

/**
 * 执行函数
 * @returns {*}
 */
function execFunc() {
    var fn = arguments[0];
    if (typeof fn == 'function') {
        var ary = [];
        for (var i = 1, len = arguments.length; i < len; i++) {
            ary.push(arguments[i]);
        }
        return fn.apply(this, ary);
    }
}

//将类数组对象转化为数组
function toArray(nodeList) {
    if (nodeList instanceof Array) {
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
function forEach(ary, fn, _this) {
    _this = _this || this;
    if (ary != null) {
        if (isArray(ary) || ary.length != null) {
            for (var i = 0, len = ary.length; i < len; i++) {
                if (fn.call(_this, ary[i], i) === false) {
                    return;
                }
            }
        } else {
            for (var name in ary) {
                if (fn.call(_this, ary[name]) === false) {
                    return;
                }
            }
        }
    }
}

var util = {
    isFunction: isFunction,
    isArray: isArray,
    isObject: isObject,
    isNumber: isNumber,
    isString: isString,
    isBoolean: isBoolean,
    isUndefined: isUndefined,
    isEmpty: isEmpty,
    isPlainObj: isPlainObj,
    equal: equal,
    Queue: Queue,
    execFunc: execFunc,
    toArray: toArray,
    Promise: Promise,
    extend: extend,
    pinyin: pinyin,
    forEach: forEach,
    clone: clone
};

module.exports = util;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../object/Array":3,"../object/Date":4,"../object/String":5}]},{},[2])