/**
 * Created by Administrator on 2018/3/30.
 */


const fs = require('fs');
const wt = require('../modules/util');


const str = '放';
console.log(str.toUtf8HexString());
console.log(str.toUtf8HexString().decodeUtf8ByHex());



