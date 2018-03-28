/**
 * Created by Administrator on 2018/3/20.
 */


let fs = require('fs');
let path = require('path');
let cheerio = require('cheerio');

let mysql = require('../../modules/mysql');
let wt = require('../../modules/util');
let cloud = require('../../modules/cloud');

let {Queue,request,getRemoteAddr} = wt;



// start('http://www.ruanyifeng.com/blog/2012/12/obama_fundraising_website.html');
start();

let Ryf = {
    baseUrl:'http://www.ruanyifeng.com',
    getInfo(url,cb){
        request(url,(err,data) => {
            if(err){
                fs.writeFile(path.resolve(__dirname,'a.html'),data);
            }else{
                cb(this.getDataByHtml(data,url));
            }
        });
    },
    getDataByHtml(str,url){
        let $ = cheerio.load(str);
        let $content = $('#main-content');
        let fmImg;
        $content.find('img').each((i,img) => {
            let $img = $(img);
            let src = $img.attr('src');
            if(src){
                src = getRemoteAddr(url,src);
                let filename = path.basename(src);
                let key = 'ryf_' + filename;
                loadImg(src,key);
                let remoteAddr = cloud.getFileAddr({Key:key});
                if(!i){
                    fmImg = remoteAddr;
                }
                $img.attr('src',remoteAddr);
            }
        });
        return {
            name:$('#page-title').text(),
            author:$('.author .url').text(),
            time:new Date($('.hentry .asset-meta .published').attr('title')).toFormatString(),
            content:$content.html().unescapeHtml(),
            sourceType:'ryf',
            fmImg,
            prevUrl:$('.entry-location li:first-child a').attr('href'),
            source:url
        }
    }
};


let imgQueue = new Queue({
    list:[],
    execFunc({Key,url},cb){
        request(url,(err,data) => {
            if(err){
                cb();
            }else{
                cloud.uploadFile({
                    Key,
                    Body:data,
                    contentLength:data.length
                },cb);
            }
        });
    }
});

const loadImg = (url,Key) => {
    imgQueue.add({
        url,
        Key
    });
    imgQueue.start();
};



function start(url){
    let queue = new Queue({
        execFunc(url,cb){
            Ryf.getInfo(url,(data) => {
                if(data){
                    Blog.insert(data,cb,(err) => {
                        console.log(err);
                        cb();
                    });
                    queue.add(data.prevUrl);
                }else{
                    cb();
                }
            });
        }
    });
    if(url){
        setTimeout(()=>{
            queue.add(url);
            queue.start();
        },0);
    }else{
        let initStart = () => {
            queue.add('http://www.ruanyifeng.com/blog/2018/03/node-debugger.html');
            queue.start();
        };
        mysql.query('select source from blog',(data) => {
            if(data.length){
                let source = data[data.length - 1].source;
                Ryf.getInfo(source,(data) => {
                    queue.add(data.prevUrl);
                    queue.start();
                })
            }else{
                initStart();
            }
        },(err) => {
            initStart();
        })
    }
}



// Ryf.getHtml('http://www.ruanyifeng.com/blog/2018/03/node-debugger.html',(data) => {
//     Blog.insert(data,(data) => {
//         console.log(data);
//     },(err) => {
//         console.log(err);
//     });
// });


let Blog = {
    insert(data,cb,eb){
        if(!wt.isArray(data)){
            data = [data];
        }
        let time = new Date().toFormatString();
        let dataSql = data.map((blog) => {
            filterQuote(blog);
            let {name,author,content,time,sourceType,source,fmImg = ''} = blog;
            return `("${name}","${author}","${content}","${time}","${sourceType}","${source}","${time}","${fmImg}")`;
        }).join(',');

        let sql = 'insert into blog(name,author,content,time,sourceType,source,createTime,fmImg) values' + dataSql;
        fs.writeFile(path.resolve(__dirname,'a.txt'),sql);
        mysql.query(sql,cb,eb);
    }
};


function filterQuote(data){
    for(let name in data){
        let value = data[name];
        if(typeof value === 'string'){
            data[name] = value.replace(/"|'/g,(match) => {
                return '\\' + match;
            });
        }
    }
}

