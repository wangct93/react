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