/**
 * Created by Administrator on 2017/11/29.
 */


var wt = require('../../modules/util');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');


var Biquge = {
    url:'http://www.biquge.com.tw',
    getInfo:function(num,cb){
        var url = this.url + '/'+ Math.floor(num / 1000) +'_' + num;
        wt.request(url,function(data){
            if(data){
                cb(this.parseInfoHtml(iconv.decode(data,'gbk')));
            }else{
                cb();
            }
        }.bind(this));
    },
    parseInfoHtml:function(html){
        var $ = cheerio.load(html);
        var $info = $('#info');
        if($info.length){
            var name = $info.find('h1').text();
            var author = $info.find('p').first().text().split('：')[1];
            var type = $info.parent().prev().text().split('>')[1].trim();
            var intro = $('#intro').find('p').first().text();
            var fmUrl = this.url + $('#fmimg').find('img').attr('src');
            var list = [];
            var $dd = $('#list').find('dd').first();
            while($dd.length){
                var $a = $dd.find('a');
                if($a.length){
                    list.push({
                        name:$a.text(),
                        url:this.url + $a.attr('href')
                    });
                }
                $dd = $dd.next();
            }
            return {
                name:name,
                author:author,
                type:type,
                intro:intro,
                fmUrl:fmUrl,
                list:list
            };
        }else{
            return null;
        }
    },
    getText:function(url,cb){
        wt.request(url,function(data){
            cb(data && this.parseTextHtml(data));
        }.bind(this));
    },
    parseTextHtml:function(data){
        var html = iconv.decode(data,'gbk');
        var $ = cheerio.load(html);
        var $content = $('#content');
        if($content.length){
            return $content.text();
        }else{
            return null;
        }
    }
};

module.exports = Biquge;