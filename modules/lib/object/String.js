/**
 * Created by Administrator on 2017/12/6.
 */
let doubleByteRe = /[^\x00-\xff]/;      //匹配双字节正则



module.exports = {
    isValid(fn) {
        return typeof fn === 'function' ? fn(this) : fn === this.toString();
    },
    charCount(char, index) {
        if (!arguments.length) {
            return this.split('').reduce((first, second) => {        //计算每个字符的出现次数
                if(first[second]){
                    first[second]++;
                }else{
                    first[second] = 1;
                }
                return first;
            }, {});
        } else {
            let count = 0;
            let str = this.substr(0, index);
            for(let i = 0;i < str.length;i++){
                if(str.charAt(i) === char){
                    count++;
                }
            }
            return count;
        }
    },
    toJSON(sep = '&', eq = '=') {
        let obj = {};
        if (this.length) {
            let ary = this.split(sep);
            ary.forEach(item => {
                if (item) {
                    let ary = item.split(eq);
                    obj[ary[0].trim()] = ary[1].trim();
                }
            });
        }
        return obj;
    },
    trim(){
        return this.toString().replace(/^\s+|\s+$/g,'');
    },
    addSpaceForJsonStr(n = 0) {
        return new Array(n + 1).join('\t') + this.replace(/[\[\]\{\},]/g, match => {
                let suf = '';
                let pre = '';
                if (match === ']' || match === '}') {
                    n--;
                    pre = '\n' + new Array(n + 1).join('\t');
                } else {
                    if(match === '[' || match === '{'){
                        n++;
                    }
                    suf = '\n' + new Array(n + 1).join('\t');
                }
                return pre + match + suf;
            });
    },
    escapeHtml(){
        return this.replace(/[<>&\s"']/g,match => '&#' +match.charCodeAt(0) + ';');
    },
    unescapeHtml(){
        return this.replace(/&#[^;]+;/g,match => {
            let codeStr = match.substr(2);
            let code;
            if(codeStr[0] === 'x'){
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
     * @param br   换行符替代元素
     * @returns {string}
     */
    limitBytes(lineBytes,max,bol,br = '<br/>'){
        let count = 0;
        let str = this.toString();
        let len = str.length;
        for(let i = 0;i < len;i++){
            let char = str.charAt(i);
            if(char === '\n'){
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
        return str.replace(/\s?\n\s?/g,br);
    },
    /**
     * 统计字节数
     * @returns {number}
     */
    countBytes(){
        let count = 0;
        let len = this.length;
        for(let i = 0;i < len;i++){
            let char = this.charAt(i);
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
    getLensAndLines(max) {
        let lineChar = '\n';
        let len = this.length;
        let lineBytes = 0;
        let tempBytes = 0;
        let lines = 1;
        for (let i = 0; i < len; i++) {
            let char = this.charAt(i);
            if (char === lineChar) {
                lines++;
                tempBytes = 0;
                if (tempBytes > lineBytes) {
                    lineBytes = tempBytes
                }
            } else {
                let bytes = doubleByteRe.test(char) ? 2 : 1;
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
    getKeywords(len,list,filter){
        len = len || 0;
        list = list || [];
        let existFunc = filter ? item => {
            let suc = filter[item];
            if(!suc){
                filter[item] = 1;
            }
            return suc;
        } : item => list.indexOf(item) !== -1;
        let strLen = this.length;
        let tempStr = '';
        if(len >= strLen){
            return list;
        }else{
            for(let i = 0,maxI = strLen - len;i < maxI;i++){
                tempStr = '';
                for(let j = 0;j <= len;j++){
                    tempStr += this.charAt(j + i);
                }
                if(!existFunc[tempStr]){
                    list.push(tempStr);
                }
            }
            return this.getKeywords(len + 1,list,filter);
        }
    },
    toNum(n = 0){
        let num = parseInt(this);
        return isNaN(num) ? n : num;
    },
    toFloatNum(n = 0){
        let num = parseFloat(this);
        return isNaN(num) ? n : num;
    },
    addZero(n){
        let len = this.length;
        let str = this.toString();
        for(let i = len;i < n;i++){
            str = '0' + str;
        }
        return str;
    },
    toUtf8HexString(){
        return this.split('').map(char => {
            let code = char.charCodeAt(0);
            return encodeUtf8(code.toString(2)).split(' ').map(binary => parseInt(binary,2).toString(16)).join(' ');
        }).join(' ');
    },
    decodeUtf8ByHex(){
        return String.fromCharCode(parseInt(decodeUtf8(parseInt(this.replace(/\s/g,''),16).toString(2)),2));
    },
    toCssValue(px = 'px'){
        let num = parseInt(this);
        return this.indexOf('%') !== -1 || isNaN(num) ? this : num + px;
    }
};

function encodeUtf8(binary){
    let length = binary.length;
    if(length < 8){
        return '0' + binary.addZero(7);
    }
    let ary = [];
    let headLen = length % 6;
    ary.push(binary.substr(0,headLen));
    for(let i = headLen;i < length;i += 6){
        ary.push(binary.substr(i,6))
    }
    let aryLen = ary.length;
    return '1'.repeat(aryLen) + '0'.repeat(8 - aryLen - headLen) + ary.join(' 10');
}


function decodeUtf8(binary){
    let length = binary.length;
    let num = Math.ceil(length / 8);
    binary.addZero(num * 8);
    let result = '';
    for(let i = 0;i < binary.length;i += 8){
        if(i === 0){
            result += binary.substr(num,8 - num).replace(/^0+/,'');
        }else{
            result += binary.substr(i + 2,6);
        }
    }
    return result;
}