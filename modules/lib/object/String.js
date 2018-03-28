/**
 * Created by Administrator on 2017/12/6.
 */
var doubleByteRe = /[^\x00-\xff]/;      //匹配双字节正则



module.exports = {
    isValid: function (fn) {
        return isFunction(fn) ? fn(this) : fn == this.toString();
    },
    charCount: function (char, index) {
        if (!arguments.length) {
            return this.split('').reduce(function (first, second) {        //计算每个字符的出现次数
                first[second]++ || (first[second] = 1);
                return first;
            }, {});
        } else {
            var count = 0;
            var str = this.substr(0, index);
            while (str.indexOf(char) > -1) {
                str = str.replace(char, '');
                count++;
            }
            return count;
        }
    },
    toJSON: function (sep, eq) {
        sep = sep || '&';
        eq = eq || '=';
        var obj = {};
        if (this.length) {
            var ary = this.split(sep);
            ary.forEach(function (item) {
                if (item) {
                    var ary = item.split(eq);
                    obj[ary[0].trim()] = ary[1].trim();
                }
            });
        }
        return obj;
    },
    trim:function(){
        return this.toString().replace(/^\s+|\s+$/,'');
    },
    addSpace:function(n) {
        n = n || 0;
        return new Array(n + 1).join('\t') + this.replace(/[\[\]\{\},]/g, function (match) {
                var suf = '';
                var pre = '';
                if (match == ']' || match == '}') {
                    n--;
                    pre = '\n' + new Array(n + 1).join('\t');
                } else {
                    if(match == '[' || match == '{'){
                        n++;
                    }
                    suf = '\n' + new Array(n + 1).join('\t');
                }
                return pre + match + suf;
            });
    },
    escapeHtml:function(){
        return this.replace(/[<>&\s"']/g,function(match){
            return '&#' +match.charCodeAt(0) + ';';
        });
    },
    unescapeHtml:function(){
        return this.replace(/&#[^;]+;/g,(match) => {
            let codeStr = match.substr(2);
            let code;
            if(codeStr[0] == 'x'){
                code = parseInt(codeStr.substr(1,codeStr.length - 2),16);
            }else{
                code = parseInt(codeStr);
            }
            return String.fromCharCode(code);
        });
    },
    /**
     * 截取最大字节数的字符串，根据剩余字符添加省略号
     * @param lineBytes     每行的字节数，用于指定换行符对应多少字符
     * @param max   最大字节数
     * @param bol   是否添加省略号
     * @returns {string}
     */
    limitBytes:function(lineBytes,max,bol,n){
        n = n == null ? '<br/>' : n;
        var count = 0;
        var str = this.toString();
        var len = str.length;
        for(var i = 0;i < len;i++){
            var char = str.charAt(i);
            if(char == '\n'){
                count = (Math.floor(count / lineBytes) + 1) * lineBytes;
            }else if(doubleByteRe.test(char)){
                count += 2;
            }else{
                count++;
            }
            if(count >= max){
                str = str.substr(0,i) + (bol === false ? '' : '...');
                break;
            }
        }
        return str.replace(/\s?\n\s?/g,n);
    },
    /**
     * 统计字节数
     * @returns {number}
     */
    countBytes:function(){
        var count = 0;
        var len = this.length;
        for(var i = 0;i < len;i++){
            var char = this.charAt(i);
            if(doubleByteRe.test(char)){
                count += 2;
            }else{
                count++;
            }
        }
        return count;
    },
    /**
     * 获取行数以及单行最大字节数
     * @param max
     * @returns {{x: number, y: number}}
     */
    getLensAndLines:function(max) {
        var lineChar = '\n';
        var len = this.length;
        var lineBytes = 0;
        var tempBytes = 0;
        var lines = 1;
        for (var i = 0; i < len; i++) {
            var char = this.charAt(i);
            if (char == lineChar) {
                lines++;
                tempBytes = 0;
                if (tempBytes > lineBytes) {
                    lineBytes = tempBytes
                }
            } else {
                var bytes = doubleByteRe.test(char) ? 2 : 1;
                tempBytes += bytes;
                if (max && tempBytes > max) {
                    lines++;
                    tempBytes = bytes;
                    lineBytes = max;
                }
            }
        }
        return {
            x: Math.max(lineBytes, tempBytes),
            y: lines
        };
    },
    /**
     * 获取所有连续的 子字符串数组
     * @param len
     * @param list
     * @param filter
     * @returns {*}
     */
    getKeywords:function(len,list,filter){
        len = len || 0;
        list = list || [];
        var existFunc = filter ? function(item){
            var suc = filter[item];
            if(!suc){
                filter[item] = 1;
            }
            return suc;
        } : function(item){
            return list.indexOf(item) != -1;
        };
        var strLen = this.length;
        var tempStr = '';
        if(len >= strLen){
            return list;
        }else{
            for(var i = 0,maxI = strLen - len;i < maxI;i++){
                tempStr = '';
                for(var j = 0;j <= len;j++){
                    tempStr += this.charAt(j + i);
                }
                if(!existFunc[tempStr]){
                    list.push(tempStr);
                }
            }
            return this.getKeywords(len + 1,list,filter);
        }
    },
    toNum:function(n){
        var num = parseInt(this);
        return isNaN(num) ? n || 0 : num;
    },
    addZero:function(n){
        var len = this.length;
        var str = this.toString();
        for(var i = len;i < n;i++){
            str = '0' + str;
        }
        return str;
    },
    toHexString:function(){
        return this.split('').map(function(item){
            return getHex(item);
        }).join(' ');
    }
};


function getHex(char){
    var code = +char.charCodeAt(0);
    var utf8Binary = getUtf8Binary(code.toString(2));
    return utf8Binary.split(' ').map(function(binary){
        return parseInt(binary,2).toString(16);
    }).join(' ');
}

function getUtf8Binary(binary){
    var len = binary.length;
    var reBinary;
    if(len < 8){
        reBinary = '0' + binary.addZero(7);
    }else if(len < 12){
        binary = binary.addZero(11);
        reBinary = '110' + binary.substr(0,5) + ' 10' + binary.substr(5);
    }else if(len < 17){
        binary = binary.addZero(16);
        reBinary = '1110' + binary.substr(0,4) + ' 10' + binary.substr(4,6) + ' 10' + binary.substr(10);
    }else if(len < 22){
        binary = binary.addZero(21);
        reBinary = '11110' + binary.substr(0,3) + ' 10' + binary.substr(3,6) + ' 10' + binary.substr(9,6) + ' 10' + binary.substr(15);
    }else if(len < 27){
        binary = binary.addZero(26);
        reBinary = '111110' + binary.substr(0,2) + ' 10' + binary.substr(2,6) + ' 10' + binary.substr(8,6) + ' 10' + binary.substr(14,6) + ' 10' + binary.substr(20);
    }else{
        binary = binary.addZero(31);
        reBinary = '1111110' + binary.substr(0,1) + ' 10' + binary.substr(1,6) + ' 10' + binary.substr(7,6) + ' 10' + binary.substr(13,6) + ' 10' + binary.substr(19,6) + ' 10' + binary.substr(25);
    }
    return reBinary;
}