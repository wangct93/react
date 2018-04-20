/**
 * Created by Administrator on 2017/12/6.
 */
let util = require('../util/util');
let $ = require('../$/$');

window.wt = util;
window.$ = window.$ || $;

/*初始化窗口宽高*/
try{
    window.innerHeight = window.innerHeight || document.documentElement.offsetHeight;
    window.innerWidth = window.innerWidth || document.documentElement.offsetWidth;
}catch(e){}


/**
 * ie判断DOM元素加载完成事件
 * @param fn
 */
function ieDOMReady(fn){
    try{
        document.documentElement.doScroll('left');
        fn();
    }catch(e){
        setTimeout(() => {
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
    return navigator.userAgent.indexOf('Firefox') !== -1;
}
/**
 * 判断是否为火狐浏览器
 * @returns {boolean}
 */
function isChrome(){
    return navigator.userAgent.indexOf('Chrome') !== -1;
}
/**
 * 判断是否为Opera浏览器
 * @returns {boolean}
 */
function isOpera(){
    return navigator.userAgent.indexOf('Opera') !== -1;
}
/**
 * 判断是否为Safari浏览器
 * @returns {boolean}
 */
function isSafari(){
    return navigator.userAgent.indexOf('Safari') !== -1;
}

/**
 * 画框方法mousedown
 * @param e
 */
function drawRectMousedown(e){
    let $div = $('<div class="rect-box"></div>');
    let $this = $(this);
    let rect = $this.getRect();
    let ox = e.clientX - rect.left;
    let oy = e.clientY - rect.top;
    let width = rect.width || rect.right - rect.left;
    let height = rect.height || rect.bottom - rect.top;
    $this.append($div);
    let posRight = width - ox;
    let posBottom = height - oy;
    $div.css({
        right:posRight / width * 100 + '%',
        bottom:posBottom / height * 100 + '%',
        width:0,
        height:0
    });

    let mousemove = e => {
        let posLeft = 'auto';
        let posTop = 'auto';
        let cx = e.clientX - rect.left;
        let cy = e.clientY - rect.top;
        let dx = cx - ox;
        let dy = cy - oy;
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

    let opt = this.drawRectOpt;
    let mouseup = e => {
        let cx = Math.max(Math.min(e.clientX - rect.left,width),0);
        let cy = Math.max(Math.min(e.clientY - rect.top,height),0);
        let pleft = Math.min(ox,cx) / width;
        let ptop = Math.min(oy,cy) / height;
        let pwidth = Math.abs(ox - cx) / width;
        let pheight = Math.abs(oy - cy) / height;
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
    let default_options = {
        url:'/',
        method:'post',
        enctype:'multipart/form-data'
    };
    let opt = util.extend({},default_options,option);
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
    let data = new FormData();
    let form = opt.form;
    $(form).find('input').forEach(input => {
        let $input = $(input);
        let name = $input.attr('name');
        if(name){
            if($input.attr('type') === 'file'){
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
    let form = opt.form;
    let $form = $(form);
    if(opt.enctype){
        $form.attr('enctype',opt.enctype);
    }
    if(opt.method){
        $form.attr('method',opt.method);
    }
    if(opt.url){
        $form.attr('action',opt.url);
    }
    let $cloneForm = $form.clone(true);
    let $iframe = $('<iframe style="display: none"></iframe>');

    let load = () => {
        $iframe.off('load',load);
        let doc = getDoc(this);
        $iframe.after($form);
        doc.body.appendChild(form);
        try {
            form.submit();
        } catch(err) {
            // just in case form has element with name/id of 'submit'
            let submitFn = document.createElement('form').submit;
            submitFn.apply(form);
        }
        let _this = this;
        let startTime = +new Date();
        let timeout = opt.timeout || 6000;
        let timer = setInterval(() => {
            if(+new Date() - startTime > timeout){
                clearInterval(timer);
                console.log('the ajaxSubmit is timeout!');
                util.execFunc(opt.error);
                $iframe.remove();
            }else{
                let doc = getDoc(_this);
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
    let doc = null;
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
 * 按顺序加载图片
 * @param option
 * 参数配置有：
 * list         表示处理的图片数组
 * imgLoad      每张图片加载完成调用
 * imgError     每张图片加载失败调用
 * success      图片全部加载好调用
 * limit        每次最大加载数量
 */

class LoadImgList{
    constructor(option){
        this.init(option);
    }
    init(option){
        let {limit = 3,list = [],interval = 30,imgLoad,imgError,errorSrc} = option;
        list = util.isArray(list) ? list : util.toArray(list);
        this.queue = new util.Queue({
            list,
            execFunc(img,cb){
                let $img = $(img);
                if($img.prop('src')){
                    cb();
                }else{
                    let src = $img.attr('dsrc');
                    setTimeout(() => {
                        if(!img.complete){
                            if(errorSrc){
                                img.src = errorSrc;
                            }else{
                                img.src = null;
                                cb();
                            }
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
            interval,
            limit
        });
    }
    load(){
        this.queue.start();
    }
    add(list){
        this.queue.addItem(list);
    }
}

/**
 * 表单取值赋值方法
 * @param opt
 * @returns {{}}
 */
function formData(opt){
    let {formatTarget = window,formatField = 'format',list = [],field = 'vtext',data} = opt;
    let result = data || {};
    $(list).forEach(elem => {
        let $elem = $(elem);
        let field = $elem.attr(field);
        if(field){
            let nodeName = $elem.getNodeName();
            let eleOpFunc = nodeName === 'INPUT' || nodeName === 'TEXTAREA' ? 'val' : 'html';
            let formatFunc = formatTarget[$elem.attr(formatField)];
            if(typeof formatFunc !== 'function'){
                formatFunc = item => item;
            }
            if(data){
                $elem[eleOpFunc](formatFunc(data[field]));
            }else{
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
function Paging(options){
    let target = options.target;
    if(target && target.nodeType === 1){
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
        let default_options = {
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
        let $box = this.$target;
        let maxPageNum = this.getMaxNum();
        let len = Math.min(maxPageNum,this.itemLength);
        let message = this.getMessage();
        let html = '<span class="paging-btn paging-btn-prev">上一页</span><div class="paging-pagebox">';
        for(let i = 1;i <= len;i++){
            html += '<span class="paging-item '+ (i === 1 ? 'active' : '') +'">'+ i +'</span>';
        }
        html += '</div><span class="paging-btn paging-btn-next">下一页</span>';
        if(this.hasInput){
            html += '<input class="paging-input" type="text">';
        }
        html += '<span class="paging-message">'+ message +'</span>';
        $box.html(html);
        $box.addClass('paging-box paging-box-' + (this.position || 'right'));
        let $btns = $box.find('.paging-btn');
        this.$prevBtn = $btns.eq(0);
        this.$nextBtn = $btns.eq(1);
        this.$input = $box.find('.paging-input');
    },
    resetTotal:function(total){
        let opt = this.opt;
        if(this.total !== total){
            this.total = total;
            let max = this.getMaxNum();
            let len = Math.min(max,this.itemLength);
            let html = '';
            let num = this.pageNum;
            for(let i = 1;i <= len;i++){
                html += '<span class="paging-item '+ (i === num ? 'active' : '') +'">'+ i +'</span>';
            }
            this.$prevBtn.next().html(html);
            this.updateBtnState();
            this.$input.next().html(this.getMessage());
        }
    },
    updateBtnState:function(){
        let $prevBtn = this.$prevBtn;
        let $nextBtn = this.$nextBtn;
        let maxPage = this.getMaxNum();
        if(this.pageNum === 1){
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
        let dic = {
            'total':this.total,
            'num':this.pageNum,
            'size':this.size,
            'maxNum':this.getMaxNum()
        };
        return this.message.replace(/\{[\w\W]*\}/g,function(match){
            let keyword = match.substring(1,match.length - 1);
            return dic[keyword] || '';
        });
    },
    addEvent:function(){
        let _this = this;
        this.$target.on('click',function(e){
            let $target = $(e.target);
            if($target.hasClass('paging-btn') && !$target.hasClass('paging-diasbaled')){
                let num = $(this).find('.active').html().toNum();
                _this.select(num + ($target.hasClass('paging-btn-next') ? 1 : -1));
            }else if($target.hasClass('paging-item')){
                _this.select($target.html().toNum());
            }
        });
        this.$input.on('keydown',function(e){
            let filterCodes = [8,37,39];
            let keyCode = e.keyCode;
            if(filterCodes.indexOf(keyCode) === -1 && !(keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 105)){
                wt.preventDefault(e);
            }
        }).on('keyup',function(e){
            let v = this.value.toNum();
            let max = _this.getMaxNum();
            if(v > max){
                v = max;
                this.value = v;
            }
            if(e.keyCode === 13){
                _this.select(v);
            }
        });
    },
    select:function(num){
        this.pageNum = num;
        let $target = this.$target;
        let len = this.itemLength;
        let maxPageNum = this.getMaxNum();
        let halfLen = Math.floor(len / 2);
        let extNum = num - halfLen;
        if(num <= halfLen + 1){
            extNum = 1;
        }else if(num > maxPageNum - halfLen){
            extNum = maxPageNum - len + 1;
        }
        $target.find('.paging-item').forEach(function(item,index){
            let $item = $(item);
            let n = extNum + index;
            $item.html(n);
            if(n === num){
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


function previewImg(){
    let $input = $(opt.input);
    let $div = $(opt.target);
    $input.on('change', function () {
        if (window.FileReader) {
            let file = this.files[0];
            let fileReader = new FileReader();
            fileReader.onload = function (ev) {
                let target = ev.target || ev.srcElement;
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
}


function fullScreen(target){
    target = target || document.body;
    let requestMethod = target.requestFullScreen || //W3C
        target.webkitRequestFullScreen ||    //Chrome等
        target.mozRequestFullScreen || //FireFox
        target.msRequestFullscreen; //IE11
    if (requestMethod) {
        requestMethod.call(target);
    }else if (typeof window.ActiveXObject !== 'undefined') {//for Internet Explorer
        try{
            let wscript = new ActiveXObject('WScript.Shell');
            wscript.SendKeys('{F11}');
        }catch(e){
            this.alert('请先将本站加入信任站点，并允许ActiveX控件交互，再进行全屏操作！');
        }
    }
}

function exitFullScreen(){
    let exitMethod = document.exitFullscreen || //W3C
        document.mozCancelFullScreen ||    //FireFox等
        document.webkitExitFullscreen || //Chrome
        document.msExitFullscreen; //IE11等
    if (exitMethod) {
        exitMethod.call(document);
    }else if (typeof window.ActiveXObject !== 'undefined') {//for Internet Explorer
        try{
            let wscript = new ActiveXObject('WScript.Shell');
            wscript.SendKeys('{F11}');
        }catch(e){
            this.alert('请先将本站加入信任站点，并允许ActiveX控件交互，再进行全屏操作！');
        }
    }
}

function getCPU(){
    let agent = navigator.userAgent.toLowerCase();
    if(agent.indexOf("win64") >= 0 || agent.indexOf("wow64") >= 0){
        return "x64";
    }
    return navigator.cpuClass;
}


let wt = {
    isIE:isIE,
    isChrome:isChrome,
    isFirefox:isFirefox,
    isSafari:isSafari,
    isOpera:isOpera,
    $:$,
    //简单封装ajax
    ajax: $.ajax,
    //添加指定js文件
    addScript: function (src, win) {
        let w = win || window;
        let doc = w.document;
        let box = doc.createDocumentFragment();
        if (!util.isArray(src)) {
            src = [src];
        }
        src.forEach(function (item) {
            let s = doc.createElement('script');
            s.src = item;
            box.appendChild(s);
        });
        doc.querySelector('head').appendChild(box);
    },
    //获取url上数据
    getQueryString: function (name, win) {
        let w = win || window;
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        let search = w.location.search.substr(1);
        let match = search.match(reg);
        return match && decodeURIComponent(match[2]);
    },
    /**
     * 添加active类
     * @param ele   元素
     * @param bol   是否删除兄弟节点的active类
     */
    addActive:function(ele,bol){
        let $ele = $(ele);
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
    formData,
    /**
     * 表单ajax提交
     */
    ajaxSubmit,
    //本地图片预览
    previewImg,
    /**
     * 弹窗方法
     * @param option
     */
    dialog:function(option){
        let closeFunc = function(){
            let $container = $(this).closest('.mask-container');
            if($container.length){
                $container.remove();
                util.execFunc(option.onClose);
            }
        };
        let defaultOpt = {
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
        let opt = util.extend(defaultOpt,option);
        opt.tools.push({
            iconCls:'icon-win-close',
            handler:closeFunc
        });
        let toolHtml = '';
        let btnHtml = '';
        opt.tools.forEach(function(item){
            toolHtml += '<span class="prompt-tool prompt-handler '+ item.iconCls +'"></span>';
        });
        opt.buttons.forEach(function(item){
            btnHtml += '<a class="w-btn prompt-handler"><i class="iconfont '+ (item.iconCls ? item.iconCls : 'iconfont-hide') +'"></i><span>'+ item.text +'</span></a>';
        });
        let html = '<div class="mask-container"><div class="mask-shadow"></div><div class="prompt-box" style="width:'
            + opt.width + 'px;height:'
            + opt.height + 'px;margin:-'
            + opt.height/2 + 'px 0 0 -'
            + opt.width/2 + 'px"><div class="prompt-header"><span>'
            + opt.title +'</span><div class="prompt-toolbox">'
            + toolHtml +'</div></div><div class="prompt-body fit" id="'
            + opt.id +'">'
            + opt.content +'</div><div class="prompt-btnbox" style="text-align:'+ opt.btnAlign +'">'
            + btnHtml +'</div></div></div>';
        let $container = $(html);
        $('body').append($container);
        $container.on('click',function(e){
            let $target = $(e.target);
            let $btn = $target.closest('.prompt-handler');
            if($btn.length){
                let btnType = $btn.hasClass('.prompt-tool') ? 'tools' : 'buttons';
                opt[btnType][$btn.index()].handler.call($btn[0]);
            }
        });
        return $container;
    },
    /**
     * 打开全屏模式
     * @param target    全屏的目标元素
     */
    fullScreen,
    /**
     * 退出全屏
     */
    exitFullScreen,
    /**
     * 获取系统位数
     * @returns {*}
     */
    getCPU,
    /**
     * 弹窗提示信息
     * @param info  内容
     */
    alert: function (info) {
        let opt = {
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
     * 获取页面最外层滚动条高度
     * @returns {*}
     */
    scrollTop:function(v){
        if(v !== undefined){
            v = v.toString().toNum();
            document.body.scrollTop = v;
            document.documentElement.scrollTop = v;
        }else{
            return document.documentElement.scrollTop || document.body.scrollTop;
        }
    },
    bindDrawRect:function(opt){
        let $target = $(opt.target);
        let target = $target[0];
        $target.on('mousedown',drawRectMousedown);
        target.onselectstart = () => {
            return false;
        };
        target.drawRectOpt = opt;
    },
    unbindDrawRect:function(opt){
        let $target = $(opt.target);
        let target = $target[0];
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

        let html = '<div class="mask-container text-center process-box"><div class="mask-shadow"></div>' +
            '<div class="process-text">'+ msg + '</div>' +
            '<div class="inline-m fit-height"></div></div>';
        let $div = $(html);
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
    Paging:Paging
};
util.extend(util,wt);