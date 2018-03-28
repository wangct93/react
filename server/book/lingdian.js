/**
 * Created by Administrator on 2017/12/26.
 */


var wt = require('../../modules/util');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var url = require('url');
var fs = require('fs');
let request = require('request');


var Lingdian = {
    host:'http://www.00ksw.org',
    getInfo:function(num,cb){
        var remoteAddr = this.host + '/html/' + Math.floor(num / 1000) +'/' + num + '/';

        request(remoteAddr).pipe(iconv.decodeStream('gbk')).collect((err,body) => {
            if(err){
                cb('');
            }else{
                cb(this.parseInfoHtml(body,remoteAddr));
            }
        });
    },
    parseInfoHtml:function(data,remoteAddr){
        var html = iconv.decode(data,'gbk');
        var $ = cheerio.load(html);
        var $top = $('.ymdz');
        var $info = $('.introduce');
        if($top.length && $info.length){
            var name = $info.find('h1').text();
            var author = $info.find('.bq').children().eq(1).text().split('：')[1];
            var state = $info.find('.bq').children().eq(2).text().split('：')[1] == '完结' ? 1 : 0;
            var type = $top.text().split('>')[1].trim();
            var intro = $info.find('.jj').text();
            var fmUrl = this.host + $info.prev().find('img').attr('src');
            var list = [];
            $('.ml_list li').each(function(i,li){
                var $a = $(li).find('a');
                if($a.length){
                    list.push({
                        name:$a.text(),
                        url:remoteAddr + $a.attr('href')
                    });
                }
            }.bind(this));
            return {
                name:name,
                author:author,
                type:type,
                intro:intro,
                list:list,
                fmUrl:fmUrl,
                state:state
            };
        }
    },
    getText:function(remoteAddr,cb){
        request(remoteAddr).pipe(iconv.decodeStream('gbk')).collect((err,body) => {
            if(err){
                console.log(err);
                cb('');
            }else{
                cb(this.parseTextHtml(body,remoteAddr));
            }
        });
    },
    parseTextHtml:function(html){
        var $ = cheerio.load(html);
        var $content = $('#articlecontent');
        if($content.length){
            return $content.text();
        }else{
            return;
        }
    }
};

module.exports = Lingdian;