/**
 * Created by Administrator on 2017/11/17.
 */

require.config({
    baseUrl:'./js',
    paths:{
        tank:'tank',
        map:'map',
        bullet:'bullet',
        mapJson:'mapJson',
        tankList:'tankList'
    }
});

$(function(){
    require(['map','tank','mapJson'],function(Map,Tank,mapJson){
        var map = new Map($('#tankBox'),mapJson);
        var tank = new Tank({
            map:map,
            x:10,
            y:28,
            control:true
        });

        var tank2 = new Tank({
            map:map,
            x:0,
            y:0,
            attackTarget:tank
        })
    });
});