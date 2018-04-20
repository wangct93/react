/**
 * Created by Administrator on 2018/4/18.
 */

const config = require('./config').mongodb;
const mongo = require('mongoose');

const {Schema} = mongo;

const insert = (data) => {

};


mongo.connect('mongodb://localhost:27017/wang');

let testSchema = new Schema({
    name:String
});



let testModel = mongo.model('test',testSchema);

let test = new testModel({name:'chui'});

test.save();
testModel.findOne((err,data) => {
    console.log(err,data);
    mongo.disconnect();
});