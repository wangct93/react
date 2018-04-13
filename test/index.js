/**
 * Created by Administrator on 2018/4/12.
 */



const fs = require('fs');

const test = () => {
    console.log(fs);
    for(let i = 0;i < 1000;i++){
        console.log(11);
    }
};




const http = require('http');


http.createServer((req,res) => {
    res.writeHead(200);
    res.end('dd');
    test();
}).listen(9854);