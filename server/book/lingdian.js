/**
 * Created by Administrator on 2017/12/26.
 */



const wt = require('../../modules/util');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const url = require('url');
const fs = require('fs');
const request = require('request');


const Lingdian = {
    host:'http://www.00ksw.org',
    getInfo(num,cb){
        let remoteAddr = this.host + '/html/' + Math.floor(num / 1000) +'/' + num + '/';
        request(remoteAddr).pipe(iconv.decodeStream('gbk')).collect((err,body) => {
            if(err){
                cb('');
            }else{
                cb(this.parseInfoHtml(body,remoteAddr));
            }
        });
    },
    parseInfoHtml(data,remoteAddr){
        let html = iconv.decode(data,'gbk');
        let $ = cheerio.load(html);
        let $top = $('.ymdz');
        let $info = $('.introduce');
        if($top.length && $info.length){
            let name = $info.find('h1').text();
            let author = $info.find('.bq').children().eq(1).text().split('：')[1];
            let state = $info.find('.bq').children().eq(2).text().split('：')[1] === '完结' ? 1 : 0;
            let type = $top.text().split('>')[1].trim();
            let intro = $info.find('.jj').text();
            let fmUrl = this.host + $info.prev().find('img').attr('src');
            let list = [];
            $('.ml_list li').each(function(i,li){
                let $a = $(li).find('a');
                if($a.length){
                    list.push({
                        name:$a.text(),
                        url:remoteAddr + $a.attr('href')
                    });
                }
            });
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
    getText(remoteAddr,cb){
        request(remoteAddr).pipe(iconv.decodeStream('gbk')).collect((err,body) => {
            if(err){
                console.log(err);
                cb('');
            }else{
                cb(this.parseTextHtml(body,remoteAddr));
            }
        });
    },
    parseTextHtml(html){
        let $ = cheerio.load(html);
        let $content = $('#articlecontent');
        return $content.length ? $content.text() : '';
    }
};

module.exports = Lingdian;