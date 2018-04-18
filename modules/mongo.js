/**
 * Created by Administrator on 2018/4/18.
 */

const mongo = require('mongoose');

const {Schema} = mongo;


mongo.connect('mongodb://localhost:27017/wang');



let model = mongo.model('d',{});

model.find({},{a:1,_id:0,age:1,name:1}).exec(function(){
    console.log(arguments);
    mongo.disconnect();
});