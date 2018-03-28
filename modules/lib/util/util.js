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
 * @param bol   是否深度克隆，默认为true
 */
function clone(obj,bol){
    bol = bol == null ? true : bol;
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


