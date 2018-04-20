/**
 * Created by Administrator on 2018/4/16.
 */


const echarts = require('echarts');
const chart = echarts.init($('#box')[0]);

chart.setOption({
    title:{
        text:'测试标题',
        subtext:'副标题',
        link:'http://www.baidu.com',
        left:'50%'
    },
    dataZoom:{
        type:'inside',
        startValue:0,
        endValue:2
    },
    legend: {},
    tooltip: {},
    xAxis: {
        type: 'category',
        data:['Matcha Latte','Milk Tea','Cheese Cocoa','Walnut Brownie']
    },
    yAxis: {},
    series: [
        {
            name:'2015',
            type: 'bar',
            data:[41,89,62,91]
        }
    ]
});