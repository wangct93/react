/**
 * Created by Administrator on 2017/9/4.
 */


let config = require('../config/server.json');
let util = require('./lib/util/util');
let defaultConfig = {
    port:8888
};

util.extend(exports,defaultConfig,config);