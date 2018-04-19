/**
 * Created by Administrator on 2018/4/12.
 */

const cloud = require('../modules/cloud');
const fs = require('fs');


cloud.getFileAddr({
    Key:'01_登录页.jpg1333524123378764'
},function(err,data){
    console.log(data);
    fs.writeFile('./test/a.text',data);
});