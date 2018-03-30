/**
 * Created by Administrator on 2017/12/6.
 */
module.exports = {
    toFormatString(str){
        str = str || 'YYYY-MM-DD hh:mm:ss';
        let config = {
            Y: this.getFullYear(),
            M: this.getMonth() + 1,
            D: this.getDate(),
            h: this.getHours(),
            m: this.getMinutes(),
            s: this.getSeconds()
        };
        for(let char in config){
            str = str.replace(new RegExp(char + '+','g'),match => config[char].toString().addZero(match.length));
        }
        return str;
    },
    diffDays(num){
        return diff(this,'Date',num);
    },
    diffMonths(num){
        return diff(this,'Month',num);
    },
    diffYears(num){
        return diff(this,'FullYear',num);
    },
    diffHours(num){
        return diff(this,'Hours',num);
    },
    diffMinutes(num){
        return diff(this,'Minutes',num);
    },
    diffSeconds(num){
        return diff(this,'Seconds',num);
    }
};

function diff(date,type,num){
    type = type || 'Year';
    let temp = ['FullYear','Date','Month','Hours','Minutes','Seconds'];
    let targetDate = new Date(date);
    if(temp.indexOf(type) !== -1){
        targetDate['set' + type](targetDate['get' + type]() + num.toString().toNum(0));
    }
    return targetDate;
}