/**
 * Created by Administrator on 2018/4/12.
 */
const fs = require('fs');
const wt = require('../modules/util');
const mapData = require('./map.json');
const areasData = mapData.features;
//  龙泉驿区 金堂县 简阳市 天府新区 青白江区 双流区 崇州市 温江区

console.log(link(['双流区','龙泉驿区']));

function link(ary){
    let firstCoords = getAreaCoordinates(ary[0]);
    let secondCoords = getAreaCoordinates(ary[1]);
    console.log(ary[0],firstCoords.length);
    console.log(ary[1],secondCoords.length);
    let filterData = firstCoords.toFieldObject(item => item.join('_'));
    return secondCoords.filter(item => filterData[item.join('_')]);
}





function getAreaData(name,list = areasData){
    return list.filter(item => item.properties.name === name)[0];
}
function getAreaCoordinates(name,list = areasData){
    let areaData = getAreaData(name,list) || {geometry:{coordinates:[[]]}};
    return areaData.geometry.coordinates[0];
}

// fs.writeFile('./test/temp.json',str);
// fs.writeFile('./test/map_cd_temp.json',JSON.stringify(data));
