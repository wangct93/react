/**
 * Created by Administrator on 2017/9/4.
 */


let config = require('../config/serverConfig');
let util = require('./lib/util/util');
let default_config = {
    port:8888
};

util.extend(exports,default_config,config);