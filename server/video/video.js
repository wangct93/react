/**
 * Created by Administrator on 2018/1/3.
 */

var fs = require('fs');
var mime = require('mime');
var path = require('path');

function main(req,res){
    var param = req.param;
    var url = param.url;
    url = path.resolve(__dirname,'..',url.substr(1));
    fs.stat(url,function(err,stat){
        if(err){
            res.writeHead(404);
            res.end();
        }else{
            var temp = req.headers.range.split(/bytes=(\d*)-(\d*)/);
            var start = parseInt(temp[1]);
            var end = parseInt(temp[2]);
            start = isNaN(start) ? 0 : start;
            end = isNaN(end) ? stat.size - 1 : end;
            start = start >= stat.size - 1 ? 0 : start;
            end  = end < start ? start : end;

            var videoStream = fs.createReadStream(url,{
                start:start,
                end:end
            });
            res.writeHead(200,{
                'content-length':end - start + 1,
                'content-type':mime.lookup(path.extname(url).substr(1)),
                'accept-ranges':'bytes'
            });
            videoStream.on('end',function(){
                res.end();
                console.log('finish');
            });
            videoStream.pipe(res);
        }
    });
}


exports.main = main;