/**
 * Created by Administrator on 2018/4/11.
 */
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');
const mime = require('mime');

let port = 8000;

let server = http.createServer(function(request, response){
    let pathname = url.parse(request.url).pathname;
    let contentType = 'video';

    fs.exists(realpath, function(exists) {

        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            })

            response.write("This request URL " + pathname + "was not found on this server");

            response.end();
        } else {
            response.setHeader("Content-Type",contentType);
            let stats = fs.statSync(realpath);
            if (request.headers["range"]) {
                console.log(request.headers["range"])
                let range = utils.parseRange(request.headers["range"], stats.size);
                console.log(range)
                if (range) {
                    response.setHeader("Content-Range", "bytes " + range.start + "-" + range.end + "/" + stats.size);
                    response.setHeader("Content-Length", (range.end - range.start + 1));
                    let stream = fs.createReadStream(realpath, {
                        start: range.start,
                        end: range.end
                    });

                    response.writeHead('206', "Partial Content");
                    stream.pipe(response);
                } else {
                    response.removeHeader("Content-Length");
                    response.writeHead(416, "Request Range Not Satisfiable");
                    response.end();
                }
            } else {
                let stream = fs.createReadStream(realpath);
                response.writeHead('200', "Partial Content");
                stream.pipe(response);
            }

        }
    })
}).listen(port,() => {
    console.log('the server is started on port '+ port +'!');
});