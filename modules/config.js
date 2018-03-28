/**
 * Created by Administrator on 2017/9/4.
 */


var config = require('../config/serverConfig');
var util = require('./lib/util/util');
var default_config = {
    port:8888
};

util.extend(exports,default_config,config);