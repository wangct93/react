/**
 * Created by Administrator on 2018/1/9.
 */

var wt = require('../modules/util');
module.exports = function(res,err){
    res.status(500).send(wt.isString(err) ? err : err && err.message);
};