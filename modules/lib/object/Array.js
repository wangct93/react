/**
 * Created by Administrator on 2017/12/6.
 */

module.exports = {
    forEach(fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn !== 'function') {
            throw new TypeError(fn + " is not a function");
        }
        let fn_this = arguments.length > 1 ? arguments[1] : this;
        for (let i = 0; i < this.length; i++) {
            fn.call(fn_this, this[i], i, this);
        }
    },
    reduce(fn, value) {
        if (!this.length) {
            return value;
        }
        if (value === undefined) {
            value = this[0];
        } else {
            value = fn(value, this[0], 0);
        }
        for (let i = 1; i < this.length; i++) {
            value = fn(value, this[i], i);
        }
        return value;
    },
    every(fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn !== 'function') {
            throw new TypeError(fn + " is not a function");
        }
        let fn_this = arguments.length > 1 ? arguments[1] : this;
        for (let i = 0; i < this.length; i++) {
            if (!fn.call(fn_this, this[i], i, this)) {
                return false;
            }
        }
        return true;
    },
    some(fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn !== 'function') {
            throw new TypeError(fn + " is not a function");
        }
        let fn_this = arguments.length > 1 ? arguments[1] : this;
        for (let i = 0; i < this.length; i++) {
            if (fn.call(fn_this, this[i], i, this)) {
                return true;
            }
        }
        return false;
    },
    map(fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn !== 'function') {
            throw new TypeError(fn + " is not a function");
        }
        let fn_this = arguments.length > 1 ? arguments[1] : this;
        let array = [];
        for (let i = 0; i < this.length; i++) {
            array.push(fn.call(fn_this, this[i], i, this));
        }
        return array;
    },
    filter(fn) {
        if (!this) {
            throw new TypeError("this is null or not defined");
        }
        if (typeof fn !== 'function') {
            throw new TypeError(fn + " is not a function");
        }
        let fn_this = arguments.length > 1 ? arguments[1] : this;
        let array = [];
        for (let i = 0; i < this.length; i++) {
            if (fn.call(fn_this, this[i], i, this)) {
                array.push(this[i]);
            }
        }
        return array;
    },
    indexOf(value) {
        if (value !== undefined) {
            for (let i = 0; i < this.length; i++) {
                if (this[i] === value) {
                    return i;
                }
            }
        }
        return -1;
    },
    indexOfFunc(fn) {
        for (let i = 0; i < this.length; i++) {
            if (typeof fn === 'function' ? fn(this[i]) : fn === this[i]) {
                return i;
            }
        }
        return -1;
    },
    remove(item) {
        for(let i = 0;i < this.length;i++){
            if(this[i] === item){
                this.splice(i, 1);
                break;
            }
        }
        return this;
    },
    toFieldObject(field){
        let target = {};
        this.forEach((item,i) => {
            let fieldStr = typeof field === 'function' ? field(item,i) : item[field] || i;
            target[fieldStr] = item;
        });
        return target;
    },
    noRepeat(){
        for(let i = 0;i < this.length;i++){
            for(let j = i + 1;j < this.length;j++){
                if(this[i] === this[j]){
                    this.splice(j,1);
                    j--;
                }
            }
        }
        return this;
    }
};