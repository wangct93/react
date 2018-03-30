/**
 * Created by Administrator on 2018/3/30.
 */


let wt = require('../modules/util');

let {extend,equal,clone} = wt;

let a = {
    a:{
        c:1
    }
};
let b = {
    b:2
};
let c = {
    c:3,
    a:b
};
let aa = {
    a:1
};
console.log(equal([1],[1]));
console.log(extend(true,a,b,c).a == a.a);
console.log(clone(c,false).a == b);

