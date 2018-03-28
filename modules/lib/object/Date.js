/**
 * Created by Administrator on 2017/12/6.
 */
module.exports = {
    toFormatString: function (str) {
        str = str || 'YYYY-MM-DD hh:mm:ss';
        var config = {
            Y: this.getFullYear(),
            M: this.getMonth() + 1,
            D: this.getDate(),
            h: this.getHours(),
            m: this.getMinutes(),
            s: this.getSeconds()
        };
        for(var char in config){
            var re = new RegExp(char + '+');
            str = str.replace(re,function(match){
                var v = config[char] + '';
                var d = match.length - v.length;
                if(d > 0){
                    v = new Array(d + 1).join('0') + v;
                }
                return v;
            });
        }
        return str;
    }
};